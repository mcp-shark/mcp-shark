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
  const { server, cleanup, logger } = createUIServer();

  // Register signal handlers
  process.on('SIGTERM', () => shutdown(cleanup, logger));
  process.on('SIGINT', () => shutdown(cleanup, logger));
  process.on('exit', () => handleExit(cleanup));

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

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runUIServer().catch((error) => {
    bootstrapLogger.error(
      { error: error.message, stack: error.stack },
      'Failed to start UI server'
    );
    process.exit(1);
  });
}
