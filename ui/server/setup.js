import { createServer } from 'node:http';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { WebSocketServer } from 'ws';

import { DependencyContainer } from '#core';
import { getDatabaseFile, prepareAppDataSpaces } from '#core/configs/index.js';
import { Server as ServerConstants } from '#core/constants/Server.js';
import { openDb } from '#core/db/init.js';

import { createBackupRoutes } from './routes/backups/index.js';
import { createCompositeRoutes } from './routes/composite/index.js';
import { createConfigRoutes } from './routes/config.js';
import { createConversationsRoutes } from './routes/conversations.js';
import { createHelpRoutes } from './routes/help.js';
import { createLogsRoutes } from './routes/logs.js';
import { createPlaygroundRoutes } from './routes/playground.js';
import { createRequestsRoutes } from './routes/requests.js';
import { createSecurityRoutes } from './routes/security.js';
import { createSessionsRoutes } from './routes/sessions.js';
import { createSettingsRoutes } from './routes/settings.js';
import { createSmartScanRoutes } from './routes/smartscan.js';
import { createStatisticsRoutes } from './routes/statistics.js';
import { swaggerSpec } from './swagger/swagger.js';
import { performCleanup } from './utils/cleanup.js';
import { getMcpSharkProcess, setMcpSharkProcess } from './utils/processState.js';
import { broadcastLogUpdate, notifyClients } from './websocket/broadcast.js';
import { handleWebSocketConnection } from './websocket/handler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Create and configure UI server
 * @returns {{server: object, cleanup: Function, logger: object}}
 */
export function createUIServer() {
  prepareAppDataSpaces();

  const db = openDb(getDatabaseFile());
  const container = new DependencyContainer(db);
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  app.use(express.json());

  // Swagger/OpenAPI documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  const clients = new Set();
  const mcpSharkLogs = [];
  const processState = { mcpSharkServer: null };
  const logger = container.getLibrary('logger');

  wss.on('connection', (ws) => handleWebSocketConnection(clients, ws, logger));

  const requestsRoutes = createRequestsRoutes(container);
  const conversationsRoutes = createConversationsRoutes(container);
  const sessionsRoutes = createSessionsRoutes(container);
  const statisticsRoutes = createStatisticsRoutes(container);
  const logsRoutes = createLogsRoutes(container, mcpSharkLogs);
  const configRoutes = createConfigRoutes(container);
  const backupRoutes = createBackupRoutes(container);

  const cleanup = async () => {
    return performCleanup(intervalId, processState, clients, wss, server, container, logger);
  };

  const compositeRoutes = createCompositeRoutes(
    container,
    () => getMcpSharkProcess(processState),
    (server) => setMcpSharkProcess(processState, server),
    mcpSharkLogs,
    (logEntry) => broadcastLogUpdate(clients, logEntry),
    cleanup
  );
  const helpRoutes = createHelpRoutes();
  const playgroundRoutes = createPlaygroundRoutes(container);
  const smartScanRoutes = createSmartScanRoutes(container);
  const settingsRoutes = createSettingsRoutes(container);
  const securityRoutes = createSecurityRoutes(container);

  app.get('/api/requests', requestsRoutes.getRequests);
  app.get('/api/packets', requestsRoutes.getRequests);
  app.get('/api/requests/:frameNumber', requestsRoutes.getRequest);
  app.get('/api/packets/:frameNumber', requestsRoutes.getRequest);
  app.get('/api/requests/export', requestsRoutes.exportRequests);
  app.post('/api/requests/clear', requestsRoutes.clearRequests);

  app.get('/api/conversations', conversationsRoutes.getConversations);

  app.get('/api/sessions', sessionsRoutes.getSessions);
  app.get('/api/sessions/:sessionId/requests', sessionsRoutes.getSessionRequests);
  app.get('/api/sessions/:sessionId/packets', sessionsRoutes.getSessionRequests);

  app.get('/api/statistics', statisticsRoutes.getStatistics);

  app.get('/api/composite/logs', logsRoutes.getLogs);
  app.post('/api/composite/logs/clear', logsRoutes.clearLogs);
  app.get('/api/composite/logs/export', logsRoutes.exportLogs);

  app.post('/api/config/services', configRoutes.extractServices);
  app.get('/api/config/read', configRoutes.readConfig);
  app.get('/api/config/detect', configRoutes.detectConfig);
  app.get('/api/config/backups', backupRoutes.listBackups);
  app.get('/api/config/backup/view', backupRoutes.viewBackup);
  app.post('/api/config/restore', backupRoutes.restoreBackup);
  app.post('/api/config/backup/delete', backupRoutes.deleteBackup);

  app.post('/api/composite/setup', compositeRoutes.setup);
  app.post('/api/composite/stop', compositeRoutes.stop);
  app.get('/api/composite/status', compositeRoutes.getStatus);
  app.get('/api/mcp-server/status', compositeRoutes.getMcpServerStatus);
  app.post('/api/composite/shutdown', compositeRoutes.shutdown);
  app.get('/api/composite/servers', compositeRoutes.getServers);

  app.get('/api/help/state', helpRoutes.getState);
  app.post('/api/help/dismiss', helpRoutes.dismiss);
  app.post('/api/help/reset', helpRoutes.reset);

  app.post('/api/playground/proxy', playgroundRoutes.proxyRequest);

  app.post('/api/smartscan/scans', smartScanRoutes.createScan);
  app.get('/api/smartscan/scans', smartScanRoutes.listScans);
  app.get('/api/smartscan/scans/:scanId', smartScanRoutes.getScan);
  app.get('/api/smartscan/token', smartScanRoutes.getToken);
  app.post('/api/smartscan/token', smartScanRoutes.saveToken);
  app.get('/api/smartscan/discover', smartScanRoutes.discoverServers);
  app.post('/api/smartscan/scans/batch', smartScanRoutes.createBatchScans);
  app.post('/api/smartscan/cached-results', smartScanRoutes.getCachedResults);
  app.post('/api/smartscan/cache/clear', smartScanRoutes.clearCache);

  app.get('/api/settings', settingsRoutes.getSettings);

  // Security routes - Static rules and scanning
  app.get('/api/security/rules', securityRoutes.getRules);
  app.post('/api/security/scan', securityRoutes.scanServer);
  app.post('/api/security/scan/batch', securityRoutes.scanMultipleServers);
  app.post('/api/security/scan/discover', securityRoutes.discoverAndScan);
  app.get('/api/security/findings', securityRoutes.getFindings);
  app.get('/api/security/findings/:id', securityRoutes.getFinding);
  app.get('/api/security/summary', securityRoutes.getSummary);
  app.get('/api/security/history', securityRoutes.getScanHistory);
  app.post('/api/security/findings/clear', securityRoutes.clearFindings);
  app.delete('/api/security/scan/:scanId', securityRoutes.deleteScanFindings);

  // Security routes - YARA engine
  app.get('/api/security/engine/status', securityRoutes.getEngineStatus);
  app.post('/api/security/engine/load', securityRoutes.loadRulesIntoEngine);

  // Security routes - Rule sources
  app.get('/api/security/sources', securityRoutes.getRuleSources);
  app.post('/api/security/sources', securityRoutes.addRuleSource);
  app.delete('/api/security/sources/:name', securityRoutes.removeRuleSource);
  app.post('/api/security/sources/:name/sync', securityRoutes.syncRuleSource);
  app.post('/api/security/sources/sync', securityRoutes.syncAllRuleSources);
  app.post('/api/security/sources/initialize', securityRoutes.initializeSources);

  // Security routes - YARA rules management
  app.get('/api/security/community-rules', securityRoutes.getCommunityRules);
  app.patch('/api/security/community-rules/:ruleId/enabled', securityRoutes.setRuleEnabled);
  app.patch('/api/security/community-rules/:ruleId', securityRoutes.updateRule);
  app.delete('/api/security/community-rules/:ruleId', securityRoutes.deleteCommunityRule);
  app.post('/api/security/community-rules', securityRoutes.addCustomRule);
  app.post('/api/security/yara/reset-defaults', securityRoutes.resetPredefinedRules);

  // Initialize YARA rules on startup (async, non-blocking)
  const rulesManager = container.getService('rulesManager');
  rulesManager.initializeSources();
  rulesManager
    .loadRulesIntoEngine()
    .then((result) => {
      logger.info({ loaded: result.loaded, failed: result.failed }, 'YARA rules loaded on startup');
    })
    .catch((err) => {
      logger.warn({ error: err.message }, 'Failed to load YARA rules on startup');
    });

  const staticPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(staticPath));

  app.get('*', (_req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });

  const requestService = container.getService('request');
  const serializationLib = container.getLibrary('serialization');
  const packetRepository = container.getRepository('packet');

  const timestampState = { lastTs: 0 };

  function checkTimestampAndNotify() {
    const lastCheck = packetRepository.getMaxTimestamp();
    if (lastCheck && lastCheck.max_ts > timestampState.lastTs) {
      timestampState.lastTs = lastCheck.max_ts;
      notifyClients(clients, requestService, serializationLib);
    }
  }

  const intervalId = setInterval(checkTimestampAndNotify, ServerConstants.PACKET_CHECK_INTERVAL_MS);

  return { server, cleanup, logger, wss };
}
