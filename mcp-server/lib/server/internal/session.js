import { randomUUID } from 'node:crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

import { getSessionFromRequest } from './handlers/common.js';

const sessions = new Map();

function storeTransportInSession(sessionId, transport) {
  sessions.set(sessionId, transport);
}

function getTransportFromSession(sessionId) {
  return sessions.get(sessionId);
}

export async function withSession(
  serverFactory,
  requestHandler,
  req,
  res,
  auditLogger
) {
  const requestedMcpServer = req.params[0];
  const sessionId = getSessionFromRequest(req);
  if (!sessionId) {
    const newSessionId = randomUUID();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => newSessionId,
      enableJsonResponse: true,
    });
    const server = serverFactory(requestedMcpServer);
    await server.connect(transport);
    storeTransportInSession(newSessionId, transport);
    // Session creation will be logged as part of the request packet in audit.js
    return requestHandler(transport, req, res, auditLogger, requestedMcpServer);
  }

  const transport = getTransportFromSession(sessionId);
  return requestHandler(transport, req, res, auditLogger, requestedMcpServer);
}
