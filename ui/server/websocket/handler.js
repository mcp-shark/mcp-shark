import { Server as ServerConstants } from '#core/constants/Server.js';

/**
 * Handle WebSocket connection with heartbeat and timeout
 * @param {Set} clients - Set of connected WebSocket clients
 * @param {WebSocket} ws - WebSocket connection
 * @param {object} logger - Logger instance
 */
export function handleWebSocketConnection(clients, ws, logger) {
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
