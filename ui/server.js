import { createServer } from 'node:http';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import express from 'express';
import { WebSocketServer } from 'ws';

import { getDatabaseFile, prepareAppDataSpaces } from '#common/configs';
import { openDb } from '#common/db/init';
import { DependencyContainer, RequestFilters } from '#core';

import { createBackupRoutes } from './server/routes/backups/index.js';
import { createCompositeRoutes } from './server/routes/composite/index.js';
import { createConfigRoutes } from './server/routes/config.js';
import { createConversationsRoutes } from './server/routes/conversations.js';
import { createHelpRoutes } from './server/routes/help.js';
import { createLogsRoutes } from './server/routes/logs.js';
import { createPlaygroundRoutes } from './server/routes/playground.js';
import { createRequestsRoutes } from './server/routes/requests.js';
import { createSessionsRoutes } from './server/routes/sessions.js';
import { createSettingsRoutes } from './server/routes/settings.js';
import { createSmartScanRoutes } from './server/routes/smartscan.js';
import { createStatisticsRoutes } from './server/routes/statistics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const _MAX_LOG_LINES = 10000;

function setMcpSharkProcess(processState, server) {
  processState.mcpSharkServer = server;
}

function handleWebSocketConnection(clients, ws) {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
}

function broadcastLogUpdate(clients, logEntry) {
  const message = JSON.stringify({ type: 'log', data: logEntry });
  clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}

function restoreConfig(container) {
  const configService = container.getService('config');
  const logService = container.getService('log');
  const restored = configService.restoreOriginalConfig();
  if (restored) {
    const timestamp = new Date().toISOString();
    const restoreLog = {
      timestamp,
      type: 'stdout',
      line: '[RESTORE] Restored original config',
    };
    logService.addLog(restoreLog);
  }
  return restored;
}

function getMcpSharkProcess(processState) {
  return processState.mcpSharkServer;
}

function notifyClients(clients, requestService, serializationLib) {
  const filters = new RequestFilters({ limit: 100 });
  const requests = requestService.getRequests(filters);
  const serialized = serializationLib.serializeBigInt(requests);
  const message = JSON.stringify({ type: 'update', data: serialized });
  clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}

async function performCleanup(intervalId, processState, clients, wss, server, container) {
  console.log('Shutting down UI server...');

  // Clear interval
  clearInterval(intervalId);

  // Stop MCP Shark server if running
  if (processState.mcpSharkServer) {
    try {
      if (processState.mcpSharkServer.stop) {
        await processState.mcpSharkServer.stop();
      }
      processState.mcpSharkServer = null;
    } catch (err) {
      console.error('Error stopping MCP Shark server:', err);
    }
  }

  // Close WebSocket connections
  clients.forEach((client) => {
    if (client.readyState === 1) {
      client.close();
    }
  });
  clients.clear();

  // Close WebSocket server
  wss.close();

  // Restore config
  restoreConfig(container);

  // Close HTTP server
  return new Promise((resolve) => {
    server.close(() => {
      console.log('UI server stopped');
      resolve();
    });
  });
}

export function createUIServer() {
  prepareAppDataSpaces();

  const db = openDb(getDatabaseFile());
  const container = new DependencyContainer(db);
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  app.use(express.json());

  const clients = new Set();
  const mcpSharkLogs = [];
  const processState = { mcpSharkServer: null };

  wss.on('connection', (ws) => handleWebSocketConnection(clients, ws));

  const requestsRoutes = createRequestsRoutes(container);
  const conversationsRoutes = createConversationsRoutes(container);
  const sessionsRoutes = createSessionsRoutes(container);
  const statisticsRoutes = createStatisticsRoutes(container);
  const logsRoutes = createLogsRoutes(container, mcpSharkLogs);
  const configRoutes = createConfigRoutes(container);
  const backupRoutes = createBackupRoutes(container);
  const compositeRoutes = createCompositeRoutes(
    container,
    () => getMcpSharkProcess(processState),
    (server) => setMcpSharkProcess(processState, server),
    mcpSharkLogs,
    (logEntry) => broadcastLogUpdate(clients, logEntry)
  );
  const helpRoutes = createHelpRoutes();
  const playgroundRoutes = createPlaygroundRoutes(container);
  const smartScanRoutes = createSmartScanRoutes(container);
  const settingsRoutes = createSettingsRoutes(container);

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
  app.post('/api/composite/stop', (req, res) => {
    compositeRoutes.stop(req, res, () => restoreConfig(container));
  });
  app.get('/api/composite/status', compositeRoutes.getStatus);
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

  const staticPath = path.join(__dirname, 'dist');
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

  const intervalId = setInterval(checkTimestampAndNotify, 500);

  const cleanup = async () => {
    return performCleanup(intervalId, processState, clients, wss, server, container);
  };

  return { server, cleanup };
}

async function shutdown(cleanup) {
  try {
    await cleanup();
  } catch (err) {
    console.error('Error during shutdown:', err);
  } finally {
    process.exit(0);
  }
}

async function handleExit(cleanup) {
  try {
    await cleanup();
  } catch (_err) {
    // Ignore errors during exit
  }
}

export async function runUIServer() {
  const port = Number.parseInt(process.env.UI_PORT) || 9853;
  const { server, cleanup } = createUIServer();

  // Register signal handlers
  process.on('SIGTERM', () => shutdown(cleanup));
  process.on('SIGINT', () => shutdown(cleanup));
  process.on('exit', () => handleExit(cleanup));

  server.listen(port, '0.0.0.0', () => {
    console.log(`UI server listening on http://localhost:${port}`);
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runUIServer().catch(console.error);
}
