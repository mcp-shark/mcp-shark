import { createServer } from 'node:http';
import { consola } from 'consola';

import { isError } from './lib/common/error.js';
import { runAllExternalServers } from './lib/server/external/all.js';

import {
  getDatabaseFile,
  getMcpConfigPath,
  prepareAppDataSpaces,
} from 'mcp-shark-common/configs/index.js';
import { initDb } from 'mcp-shark-common/db/init.js';
import { getLogger } from 'mcp-shark-common/db/logger.js';
import { withAuditRequestResponseHandler } from './lib/auditor/audit.js';
import { getInternalServer } from './lib/server/internal/run.js';
import { createInternalServerFactory } from './lib/server/internal/server.js';

function initAuditLogger(logger) {
  logger.info('Initializing audit logger at', getDatabaseFile());
  return getLogger(initDb(getDatabaseFile()));
}

/**
 * Start the MCP Shark server
 * @param {Object} options - Configuration options
 * @param {string} [options.configPath] - Path to MCP config file (defaults to getMcpConfigPath())
 * @param {number} [options.port=9851] - Port to listen on
 * @param {Object} [options.logger] - Logger instance (defaults to consola)
 * @param {Function} [options.onError] - Error callback
 * @param {Function} [options.onReady] - Ready callback
 * @returns {Promise<{app: Express, server: http.Server, stop: Function}>} Server instance
 */
export async function startMcpSharkServer(options = {}) {
  const {
    configPath = getMcpConfigPath(),
    port = 9851,
    logger = consola,
    onError,
    onReady,
  } = options;

  logger.level = 'info';

  prepareAppDataSpaces();

  logger.info('[MCP-Shark] Starting MCP server...');
  logger.info(`[MCP-Shark] Config path: ${configPath}`);
  logger.info(`[MCP-Shark] Database path: ${getDatabaseFile()}`);
  logger.info(`[MCP-Shark] Working directory: ${process.cwd()}`);
  logger.info(`[MCP-Shark] PATH: ${process.env.PATH}`);

  try {
    const auditLogger = initAuditLogger(logger);
    const externalServersResult = await runAllExternalServers(logger, configPath);

    if (isError(externalServersResult)) {
      const error = new Error(JSON.stringify(externalServersResult));
      if (onError) onError(error);
      throw error;
    }

    const { kv, servers: externalServers } = externalServersResult;

    const internalServerFactory = createInternalServerFactory(logger, kv);
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
        logger.info(`MCP proxy HTTP server listening on http://localhost:${port}/mcp`);
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
            logger.warn('Error closing external server client:', err);
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
          logger.info('MCP Shark server stopped');
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
    logger.error(`[MCP-Shark] ${errorMsg}:`, error);
    logger.error(`[MCP-Shark] Error message: ${error.message}`);
    if (error.stack) {
      logger.error('[MCP-Shark] Error stack:', error.stack);
    }
    if (onError) onError(error);
    throw error;
  }
}
