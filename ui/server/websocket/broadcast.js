import { RequestFilters } from '#core';

/**
 * Broadcast log update to all connected WebSocket clients
 * @param {Set} clients - Set of connected WebSocket clients
 * @param {object} logEntry - Log entry to broadcast
 */
export function broadcastLogUpdate(clients, logEntry) {
  const message = JSON.stringify({ type: 'log', data: logEntry });
  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(message);
    }
  }
}

/**
 * Notify all connected clients about request updates
 * @param {Set} clients - Set of connected WebSocket clients
 * @param {object} requestService - Request service instance
 * @param {object} serializationLib - Serialization library instance
 */
export function notifyClients(clients, requestService, serializationLib) {
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
