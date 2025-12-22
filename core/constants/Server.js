/**
 * Server configuration constants
 */
export const Server = {
  // Default ports
  DEFAULT_UI_PORT: 9853,
  DEFAULT_MCP_SERVER_PORT: 9851,

  // Connection settings
  WEBSOCKET_HEARTBEAT_INTERVAL_MS: 30000, // 30 seconds
  WEBSOCKET_TIMEOUT_MS: 1800000, // 30 minutes
  MCP_CLIENT_SESSION_TIMEOUT_MS: 1800000, // 30 minutes

  // Polling intervals
  PACKET_CHECK_INTERVAL_MS: 500,

  // Limits
  MAX_LOG_LINES: 10000,
  MAX_WEBSOCKET_CONNECTIONS: 1000,
};
