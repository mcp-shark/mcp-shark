import cors from 'cors';
import express from 'express';

import { withSession } from './session.js';

async function handleMcpRoute(
  req,
  res,
  serverFactory,
  withAuditRequestResponseHandler,
  auditLogger
) {
  await withSession(serverFactory, withAuditRequestResponseHandler, req, res, auditLogger);
}

function handleNotFoundRoute(_req, res) {
  res.status(404).json({ error: 'Not found' });
}

export function getInternalServer(serverFactory, auditLogger, withAuditRequestResponseHandler) {
  const app = express();

  // Parse JSON body for POST requests
  app.use(express.json());
  app.use(
    '/mcp',
    cors({
      origin: ['*'],
      methods: ['*'],
      allowedHeaders: ['*'],
      exposedHeaders: ['*'],
    })
  );

  app.all('/mcp/*', (req, res) => {
    return handleMcpRoute(req, res, serverFactory, withAuditRequestResponseHandler, auditLogger);
  });

  // Catch-all for other routes (404)
  app.use(handleNotFoundRoute);

  return app;
}

function handleServerListen(logger, port) {
  logger.info(`MCP proxy HTTP server listening on http://localhost:${port}/mcp`);
}

export function runInternalServer(logger, port, app) {
  app.listen(port, '0.0.0.0', () => {
    handleServerListen(logger, port);
  });
}
