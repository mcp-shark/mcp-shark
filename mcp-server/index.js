import { createServer } from 'node:http';

import serverLogger from '#common/logger';
import { isError } from './lib/common/error.js';
import { runAllExternalServers } from './lib/server/external/all.js';

import { getDatabaseFile, getMcpConfigPath, prepareAppDataSpaces } from '#common/configs';
import { initDb } from '#common/db/init';
import { getLogger } from '#common/db/logger';
import { withAuditRequestResponseHandler } from './lib/auditor/audit.js';
import { getInternalServer } from './lib/server/internal/run.js';
import { createInternalServerFactory } from './lib/server/internal/server.js';

function initAuditLogger(serverLogger) {
  serverLogger.info({ path: getDatabaseFile() }, 'Initializing audit logger at');
  return getLogger(initDb(getDatabaseFile()));
}

/**
 * Start the MCP Shark server
 * @param {Object} options - Configuration options
 * @param {string} [options.configPath] - Path to MCP config file (defaults to getMcpConfigPath())
 * @param {number} [options.port=9851] - Port to listen on
 * @param {Function} [options.onError] - Error callback
 * @param {Function} [options.onReady] - Ready callback
 * @returns {Promise<{app: Express, server: http.Server, stop: Function}>} Server instance
 */
export async function startMcpSharkServer(options = {}) {
  const { configPath = getMcpConfigPath(), port = 9851, onError, onReady } = options;

  prepareAppDataSpaces();

  serverLogger.info('[MCP-Shark] Starting MCP server...');
  serverLogger.info(`[MCP-Shark] Config path: ${configPath}`);
  serverLogger.info(`[MCP-Shark] Database path: ${getDatabaseFile()}`);
  serverLogger.info(`[MCP-Shark] Working directory: ${process.cwd()}`);
  serverLogger.info(`[MCP-Shark] PATH: ${process.env.PATH}`);

  try {
    const auditLogger = initAuditLogger(serverLogger);
    const externalServersResult = await runAllExternalServers(serverLogger, configPath);

    if (isError(externalServersResult)) {
      const error = new Error(JSON.stringify(externalServersResult));
      if (onError) onError(error);
      throw error;
    }

    const { kv, servers: externalServers } = externalServersResult;

    const internalServerFactory = createInternalServerFactory(serverLogger, kv);
    const app = getInternalServer(
      internalServerFactory,
      auditLogger,
      withAuditRequestResponseHandler
    );

    const httpServer = createServer(app);

    const server = await new Promise((resolve, reject) => {
      httpServer.on('error', (err) => {
        if (onError) onError(err);
        reject(err);
      });

      httpServer.listen(port, '0.0.0.0', () => {
        serverLogger.info(`MCP proxy HTTP server listening on http://localhost:${port}/mcp`);
        if (onReady) onReady();
        resolve(httpServer);
      });
    });

    const stop = async () => {
      // Close all external server clients
      for (const serverInfo of externalServers) {
        if (serverInfo?.client && !isError(serverInfo)) {
          try {
            await serverInfo.client.close();
          } catch (err) {
            serverLogger.warn({ error: err.message }, 'Error closing external server client');
          }
        }
      }

      // Close all connections forcefully
      if (server.closeAllConnections) {
        server.closeAllConnections();
      }

      // Close the server
      return new Promise((resolve) => {
        server.close(() => {
          serverLogger.info('MCP Shark server stopped');
          resolve();
        });
      });
    };

    return {
      app,
      server,
      stop,
      auditLogger,
    };
  } catch (error) {
    const errorMsg = 'Error starting MCP server';
    serverLogger.error({ error: error.message, stack: error.stack }, `[MCP-Shark] ${errorMsg}`);
    if (onError) onError(error);
    throw error;
  }
}
