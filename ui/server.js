import { pathToFileURL } from 'node:url';

import { Environment } from '#core/configs/index.js';
import { bootstrapLogger } from '#core/libraries/index.js';

import { createUIServer } from './server/setup.js';
import { handleExit, shutdown } from './server/utils/signals.js';

/**
 * Run UI server with signal handlers
 */
export async function runUIServer() {
  const port = Environment.getUiPort();
  const { server, cleanup, logger, wss } = createUIServer();

  // Register signal handlers
  process.on('SIGTERM', () => shutdown(cleanup, logger));
  process.on('SIGINT', () => shutdown(cleanup, logger));
  process.on('exit', () => handleExit(cleanup));

  // Handle server errors (e.g., port already in use)
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      logger?.error(
        {
          port,
          error: error.message,
        },
        `Port ${port} is already in use. Please stop the existing server or use a different port.`
      );
      bootstrapLogger.error(
        `\n❌ Port ${port} is already in use.\n   Please stop the existing server or set MCP_SHARK_PORT environment variable to use a different port.\n`
      );
    } else {
      logger?.error({ error: error.message, stack: error.stack }, 'Server error');
      bootstrapLogger.error({ error: error.message }, 'Server error');
    }
    process.exit(1);
  });

  // Handle WebSocket server errors
  if (wss) {
    wss.on('error', (error) => {
      logger?.error({ error: error.message }, 'WebSocket server error');
      if (error.code === 'EADDRINUSE') {
        bootstrapLogger.error(
          `\n❌ WebSocket port conflict. Port ${port} is already in use.\n   Please stop the existing server or use a different port.\n`
        );
      }
    });
  }

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
