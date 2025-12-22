import { createServer } from 'node:http';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import express from 'express';
import { WebSocketServer } from 'ws';

import { DependencyContainer, RequestFilters } from '#core';
import { Environment, getDatabaseFile, prepareAppDataSpaces } from '#core/configs/index.js';
import { Server as ServerConstants } from '#core/constants/Server.js';
import { openDb } from '#core/db/init.js';
import { bootstrapLogger } from '#core/libraries/index.js';

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

function setMcpSharkProcess(processState, server) {
  processState.mcpSharkServer = server;
}

function handleWebSocketConnection(clients, ws, logger) {
  clients.add(ws);

  // Set up timeout to close stale connections
  let timeoutId = setTimeout(() => {
    if (ws.readyState === 1) {
      logger?.warn('WebSocket connection timeout, closing');
      ws.close();
    }
  }, ServerConstants.WEBSOCKET_TIMEOUT_MS);

  // Set up heartbeat to keep connection alive
  const heartbeatInterval = setInterval(() => {
    if (ws.readyState === 1) {
      ws.ping();
    } else {
      clearInterval(heartbeatInterval);
    }
  }, ServerConstants.WEBSOCKET_HEARTBEAT_INTERVAL_MS);

  ws.on('pong', () => {
    // Reset timeout on pong
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      if (ws.readyState === 1) {
        logger?.warn('WebSocket connection timeout, closing');
        ws.close();
      }
    }, ServerConstants.WEBSOCKET_TIMEOUT_MS);
  });

  ws.on('close', () => {
    clearTimeout(timeoutId);
    clearInterval(heartbeatInterval);
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    logger?.error({ error: error.message }, 'WebSocket error');
    clearTimeout(timeoutId);
    clearInterval(heartbeatInterval);
    clients.delete(ws);
  });
}

function broadcastLogUpdate(clients, logEntry) {
  const message = JSON.stringify({ type: 'log', data: logEntry });
  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(message);
    }
  }
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
  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(message);
    }
  }
}

async function performCleanup(intervalId, processState, clients, wss, server, container, logger) {
  logger?.info('Shutting down UI server...');

  // Clear interval
  clearInterval(intervalId);

  // Stop MCP Shark server if running and restore config
  // Use ServerManagementService to ensure proper cleanup and config restoration
  try {
    const serverManagementService = container.getService('serverManagement');
    const serverStatus = serverManagementService.getServerStatus();

    if (serverStatus.running) {
      logger?.info('Stopping MCP Shark server...');
      try {
        await serverManagementService.stopServer();
        logger?.info('MCP Shark server stopped');
      } catch (stopErr) {
        logger?.warn(
          { error: stopErr.message },
          'Error stopping MCP Shark server, continuing with cleanup'
        );
      }
    }
  } catch (err) {
    logger?.warn(
      { error: err.message },
      'Error accessing server management service during shutdown'
    );
    // Continue with cleanup even if server stop fails
  }

  // Restore config (always attempt, even if server stop failed)
  // This ensures patched configs are restored on exit
  try {
    const configService = container.getService('config');
    const restored = configService.restoreOriginalConfig();
    if (restored) {
      logger?.info('Config restored successfully');
    }
  } catch (configErr) {
    logger?.warn({ error: configErr.message }, 'Failed to restore config during shutdown');
    // Continue anyway - config restoration failure shouldn't prevent exit
  }

  // Clear process state
  processState.mcpSharkServer = null;

  // Close WebSocket connections
  try {
    for (const client of clients) {
      if (client.readyState === 1) {
        client.close();
      }
    }
    clients.clear();
  } catch (err) {
    logger?.warn({ error: err.message }, 'Error closing WebSocket connections');
  }

  // Close WebSocket server
  try {
    wss.close();
  } catch (err) {
    logger?.warn({ error: err.message }, 'Error closing WebSocket server');
  }

  // Close HTTP server
  return new Promise((resolve) => {
    try {
      server.close(() => {
        logger?.info('UI server stopped');
        resolve();
      });
    } catch (err) {
      logger?.warn({ error: err.message }, 'Error closing HTTP server');
      resolve(); // Resolve anyway to allow exit
    }
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

  wss.on('connection', (ws) => handleWebSocketConnection(clients, ws, logger));

  const requestsRoutes = createRequestsRoutes(container);
  const conversationsRoutes = createConversationsRoutes(container);
  const sessionsRoutes = createSessionsRoutes(container);
  const statisticsRoutes = createStatisticsRoutes(container);
  const logsRoutes = createLogsRoutes(container, mcpSharkLogs);
  const configRoutes = createConfigRoutes(container);
  const backupRoutes = createBackupRoutes(container);
  const logger = container.getLibrary('logger');
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

  const intervalId = setInterval(checkTimestampAndNotify, ServerConstants.PACKET_CHECK_INTERVAL_MS);

  return { server, cleanup, logger };
}

async function shutdown(cleanup, logger) {
  try {
    // Set a timeout to force exit if cleanup takes too long
    const timeout = setTimeout(() => {
      logger?.warn('Shutdown timeout reached, forcing exit');
      process.exit(0);
    }, 5000); // 5 second timeout

    await cleanup();
    clearTimeout(timeout);
  } catch (err) {
    logger?.warn({ error: err.message }, 'Error during shutdown, exiting anyway');
  } finally {
    // Always exit, even if cleanup failed
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
  const port = Environment.getUiPort();
  const { server, cleanup, logger } = createUIServer();

  // Register signal handlers
  process.on('SIGTERM', () => shutdown(cleanup, logger));
  process.on('SIGINT', () => shutdown(cleanup, logger));
  process.on('exit', () => handleExit(cleanup));

  server.listen(port, '0.0.0.0', () => {
    logger?.info({ port }, 'UI server listening');
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runUIServer().catch((error) => {
    bootstrapLogger.error(
      { error: error.message, stack: error.stack },
      'Failed to start UI server'
    );
    process.exit(1);
  });
}
