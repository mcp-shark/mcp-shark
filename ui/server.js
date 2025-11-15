import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'url';

import { openDb } from 'mcp-shark-common/db/init.js';
import {
  getDatabaseFile,
  prepareAppDataSpaces,
  getMcpConfigPath,
} from 'mcp-shark-common/configs/index.js';
import { queryRequests } from 'mcp-shark-common/db/query.js';
import { restoreOriginalConfig } from './server/utils/config.js';

import { createRequestsRoutes } from './server/routes/requests.js';
import { createConversationsRoutes } from './server/routes/conversations.js';
import { createSessionsRoutes } from './server/routes/sessions.js';
import { createStatisticsRoutes } from './server/routes/statistics.js';
import { createLogsRoutes } from './server/routes/logs.js';
import { createConfigRoutes } from './server/routes/config.js';
import { createCompositeRoutes } from './server/routes/composite.js';
import { createHelpRoutes } from './server/routes/help.js';
import { createPlaygroundRoutes } from './server/routes/playground.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_LOG_LINES = 10000;

export function createUIServer() {
  prepareAppDataSpaces();

  const db = openDb(getDatabaseFile());
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  app.use(express.json());

  const clients = new Set();
  const mcpSharkLogs = [];
  const processState = { mcpSharkProcess: null };

  const setMcpSharkProcess = (process) => {
    processState.mcpSharkProcess = process;
  };

  wss.on('connection', (ws) => {
    clients.add(ws);
    ws.on('close', () => clients.delete(ws));
  });

  const broadcastLogUpdate = (logEntry) => {
    const message = JSON.stringify({ type: 'log', data: logEntry });
    clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  };

  const restoreConfig = () => {
    return restoreOriginalConfig(mcpSharkLogs, broadcastLogUpdate);
  };

  const requestsRoutes = createRequestsRoutes(db);
  const conversationsRoutes = createConversationsRoutes(db);
  const sessionsRoutes = createSessionsRoutes(db);
  const statisticsRoutes = createStatisticsRoutes(db);
  const logsRoutes = createLogsRoutes(mcpSharkLogs, broadcastLogUpdate);
  const configRoutes = createConfigRoutes();
  const getMcpSharkProcess = () => processState.mcpSharkProcess;
  const compositeRoutes = createCompositeRoutes(
    getMcpSharkProcess,
    setMcpSharkProcess,
    mcpSharkLogs,
    broadcastLogUpdate
  );
  const helpRoutes = createHelpRoutes();
  const playgroundRoutes = createPlaygroundRoutes();

  app.get('/api/requests', requestsRoutes.getRequests);
  app.get('/api/packets', requestsRoutes.getRequests);
  app.get('/api/requests/:frameNumber', requestsRoutes.getRequest);
  app.get('/api/packets/:frameNumber', requestsRoutes.getRequest);
  app.get('/api/requests/export', requestsRoutes.exportRequests);

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
  app.get('/api/config/backups', configRoutes.listBackups);
  app.post('/api/config/restore', (req, res) => {
    configRoutes.restoreBackup(req, res, mcpSharkLogs, broadcastLogUpdate);
  });

  app.post('/api/composite/setup', compositeRoutes.setup);
  app.post('/api/composite/stop', (req, res) => {
    compositeRoutes.stop(req, res, restoreConfig);
  });
  app.get('/api/composite/status', compositeRoutes.getStatus);

  app.get('/api/help/state', helpRoutes.getState);
  app.post('/api/help/dismiss', helpRoutes.dismiss);
  app.post('/api/help/reset', helpRoutes.reset);

  app.post('/api/playground/proxy', playgroundRoutes.proxyRequest);

  const cleanup = () => {
    if (processState.mcpSharkProcess) {
      processState.mcpSharkProcess.kill();
      processState.mcpSharkProcess = null;
    }
    restoreConfig();
  };

  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);
  process.on('exit', () => {
    restoreConfig();
  });

  const staticPath = path.join(__dirname, 'dist');
  app.use(express.static(staticPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });

  const notifyClients = async () => {
    const requests = queryRequests(db, { limit: 100 });
    const { serializeBigInt } = await import('./server/utils/serialization.js');
    const message = JSON.stringify({ type: 'update', data: serializeBigInt(requests) });
    clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  };

  const timestampState = { lastTs: 0 };
  setInterval(() => {
    const lastCheck = db.prepare('SELECT MAX(timestamp_ns) as max_ts FROM packets').get();
    if (lastCheck && lastCheck.max_ts > timestampState.lastTs) {
      timestampState.lastTs = lastCheck.max_ts;
      notifyClients();
    }
  }, 500);

  return { server, cleanup };
}

export async function runUIServer() {
  const port = parseInt(process.env.UI_PORT) || 9853;
  const { server, cleanup } = createUIServer();

  server.listen(port, '0.0.0.0', () => {
    console.log(`UI server listening on http://localhost:${port}`);
  });

  server.on('close', () => {
    cleanup();
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runUIServer().catch(console.error);
}
