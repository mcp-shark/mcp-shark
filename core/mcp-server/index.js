import { createServer } from 'node:http';

import serverLogger from '#common/logger';
import { isError } from '#core/libraries/ErrorLibrary.js';
import { runAllExternalServers } from './server/external/all.js';

import { getDatabaseFile, getMcpConfigPath, prepareAppDataSpaces } from '#common/configs';
import { initDb } from '#common/db/init';
import { DependencyContainer } from '#core';
import { withAuditRequestResponseHandler } from './auditor/audit.js';
import { getInternalServer } from './server/internal/run.js';
import { createInternalServerFactory } from './server/internal/server.js';

/**
 * Initialize audit logger
 * @param {Object} serverLogger - Logger instance
 * @returns {Object} Audit logger instance
 */
export function initAuditLogger(serverLogger) {
  serverLogger.info({ path: getDatabaseFile() }, 'Initializing audit logger at');
  const db = initDb(getDatabaseFile());
  const container = new DependencyContainer(db);
  return container.getAuditLogger();
}

function createCloseCallback(serverLogger, resolve) {
  return () => {
    serverLogger.info('MCP Shark server stopped');
    resolve();
  };
}

async function performStop(server, externalServers, serverLogger) {
  // Close all external server clients
  for (const serverInfo of externalServers) {
    if (serverInfo?.client && !isError(serverInfo)) {
      try {
        await serverInfo.client.close();
      } catch (error) {
        serverLogger.warn(
          { error, message: error.message },
          'Error closing external server client'
        );
      }
    }
  }

  // Close all connections forcefully
  if (server.closeAllConnections) {
    server.closeAllConnections();
  }

  // Close the server
  return new Promise((resolve) => {
    const closeCallback = createCloseCallback(serverLogger, resolve);
    server.close(closeCallback);
  });
}

function stopFunctionWrapper(server, externalServers, serverLogger) {
  return performStop(server, externalServers, serverLogger);
}

async function stopServerWrapper(server, externalServers, serverLogger) {
  return stopFunctionWrapper(server, externalServers, serverLogger);
}

function createStopFunction(server, externalServers, serverLogger) {
  return async () => {
    return stopServerWrapper(server, externalServers, serverLogger);
  };
}

function handleServerError(error, serverLogger, onError, reject) {
  serverLogger.error(
    { error, message: error.message, stack: error.stack },
    `[MCP-Shark] ${error.message}`
  );
  if (onError) {
    onError(error);
  }
  reject(error);
}

function handleServerReady(httpServer, port, serverLogger, onReady, resolve) {
  serverLogger.info(`MCP proxy HTTP server listening on http://localhost:${port}/mcp`);
  if (onReady) {
    onReady();
  }
  resolve(httpServer);
}

function createServerPromise(httpServer, port, serverLogger, onError, onReady) {
  return new Promise((resolve, reject) => {
    httpServer.on('error', (error) => {
      handleServerError(error, serverLogger, onError, reject);
    });

    httpServer.listen(port, '0.0.0.0', () => {
      handleServerReady(httpServer, port, serverLogger, onReady, resolve);
    });
  });
}

/**
 * Start the MCP Shark server
 * @param {Object} options - Configuration options
 * @param {string} [options.configPath] - Path to MCP config file (defaults to getMcpConfigPath())
 * @param {number} [options.port=9851] - Port to listen on
 * @param {Function} [options.onError] - Error callback
 * @param {Function} [options.onReady] - Ready callback
 * @param {Object} options.auditLogger - Required audit logger instance (use initAuditLogger() to create)
 * @returns {Promise<{app: Express, server: http.Server, stop: Function}>} Server instance
 */
export async function startMcpSharkServer(options = {}) {
  const {
    configPath = getMcpConfigPath(),
    port = 9851,
    onError,
    onReady,
    auditLogger: providedAuditLogger,
  } = options;

  prepareAppDataSpaces();

  serverLogger.info('[MCP-Shark] Starting MCP server...');
  serverLogger.info(`[MCP-Shark] Config path: ${configPath}`);
  serverLogger.info(`[MCP-Shark] Database path: ${getDatabaseFile()}`);
  serverLogger.info(`[MCP-Shark] Working directory: ${process.cwd()}`);
  serverLogger.info(`[MCP-Shark] PATH: ${process.env.PATH}`);

  try {
    if (!providedAuditLogger) {
      throw new Error('auditLogger is required. Call initAuditLogger() and pass it in options.');
    }
    const auditLogger = providedAuditLogger;
    const externalServersResult = await runAllExternalServers(serverLogger, configPath);

    if (isError(externalServersResult)) {
      serverLogger.error(
        {
          error: externalServersResult,
          message: externalServersResult.message,
          stack: externalServersResult.stack,
        },
        `[MCP-Shark] ${externalServersResult.message}`
      );
      const error = new Error(JSON.stringify(externalServersResult));
      if (onError) {
        onError(error);
      }
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

    const server = await createServerPromise(httpServer, port, serverLogger, onError, onReady);

    const stop = createStopFunction(server, externalServers, serverLogger);

    return {
      app,
      server,
      stop,
      auditLogger,
    };
  } catch (error) {
    const errorMsg = 'Error starting MCP server';
    serverLogger.error(
      { error, message: error.message, stack: error.stack },
      `[MCP-Shark] ${errorMsg}`
    );
    if (onError) {
      onError(error);
    }
    throw error;
  }
}
