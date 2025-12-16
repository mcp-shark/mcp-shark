// CLI entry point - uses the library
import { startMcpSharkServer } from './index.js';

async function main() {
  try {
    await startMcpSharkServer({
      onReady: () => {
        const successMsg = 'MCP server started successfully';
        console.log(`[MCP-Shark] ${successMsg}`);
      },
      onError: (error) => {
        const errorMsg = 'Error starting MCP server';
        console.error(`[MCP-Shark] ${errorMsg}:`, error);
        console.error(`[MCP-Shark] Error message: ${error.message}`);
        if (error.stack) {
          console.error('[MCP-Shark] Error stack:', error.stack);
        }
        process.exit(1);
      },
    });
  } catch (error) {
    const errorMsg = 'Error starting MCP server';
    console.error(`[MCP-Shark] ${errorMsg}:`, error);
    console.error(`[MCP-Shark] Error message: ${error.message}`);
    if (error.stack) {
      console.error('[MCP-Shark] Error stack:', error.stack);
    }
    process.exit(1);
  }
}

main();
