/**
 * Perform cleanup operations on shutdown
 * @param {number} intervalId - Interval ID to clear
 * @param {object} processState - Process state object
 * @param {Set} clients - Set of WebSocket clients
 * @param {WebSocketServer} wss - WebSocket server instance
 * @param {object} server - HTTP server instance
 * @param {object} container - Dependency container
 * @param {object} logger - Logger instance
 * @returns {Promise} Promise that resolves when cleanup is complete
 */
export async function performCleanup(
  intervalId,
  processState,
  clients,
  wss,
  server,
  container,
  logger
) {
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
