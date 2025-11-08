import express from 'express';

import { withSession } from './session.js';

export function getInternalServer(
  serverFactory,
  auditLogger,
  withAuditRequestResponseHandler
) {
  const app = express();

  // Parse JSON body for POST requests
  app.use(express.json());

  app.all('/mcp', async (req, res) => {
    await withSession(
      serverFactory,
      withAuditRequestResponseHandler,
      req,
      res,
      auditLogger
    );
  });

  // Catch-all for other routes (404)
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}

export function runInternalServer(logger, port, app) {
  app.listen(port, '0.0.0.0', () => {
    logger.info(
      `MCP proxy HTTP server listening on http://localhost:${port}/mcp`
    );
  });
}
