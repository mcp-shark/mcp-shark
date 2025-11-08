export const SERVER_NAME = 'mcp-internal-server';
export const TRANSPORT_TYPE = 'http';

export function getSessionFromRequest(req) {
  if (!req) {
    return null;
  }
  if (req.sessionId) {
    return req.sessionId;
  }
  if (req.get && typeof req.get === 'function') {
    if (req.get('Mcp-Session-Id')) {
      return req.get('Mcp-Session-Id');
    }
    if (req.get('X-MCP-Session-Id')) {
      return req.get('X-MCP-Session-Id');
    }
  }
  return null;
}
