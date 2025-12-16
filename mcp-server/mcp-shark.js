import logger from '../shared/logger.js';
// CLI entry point - uses the library
import { startMcpSharkServer } from './index.js';

async function main() {
  try {
    await startMcpSharkServer({
      onReady: () => {
        logger.info('[MCP-Shark] MCP server started successfully');
      },
      onError: (error) => {
        logger.error({ error: error.message, stack: error.stack }, 'Error starting MCP server');
        process.exit(1);
      },
    });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, 'Error starting MCP server');
    process.exit(1);
  }
}

main();
