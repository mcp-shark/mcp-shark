import * as path from 'node:path';
import { consola } from 'consola';

import { runAllExternalServers } from './lib/server/external/all.js';
import { isError } from './lib/common/error.js';

import { createInternalServerFactory } from './lib/server/internal/server.js';
import {
  getInternalServer,
  runInternalServer,
} from './lib/server/internal/run.js';
import { initDb } from 'mcp-shark-common/db/init.js';
import { getLogger } from 'mcp-shark-common/db/logger.js';
import {
  getDatabaseFile,
  getMcpConfigPath,
  prepareAppDataSpaces,
} from 'mcp-shark-common/configs/index.js';
import { withAuditRequestResponseHandler } from './lib/auditor/audit.js';

function initAuditLogger(logger) {
  logger.info('Initializing audit logger at', getDatabaseFile());
  return getLogger(initDb(getDatabaseFile()));
}

async function main() {
  consola.level = 'info'; // 'debug';

  prepareAppDataSpaces();

  const configPath = getMcpConfigPath();
  console.log('[MCP-Shark] Starting MCP server...');
  console.log(`[MCP-Shark] Config path: ${configPath}`);
  console.log(`[MCP-Shark] Database path: ${getDatabaseFile()}`);
  console.log(`[MCP-Shark] Working directory: ${process.cwd()}`);
  console.log(`[MCP-Shark] PATH: ${process.env.PATH}`);

  const auditLogger = initAuditLogger(consola);
  const result = await runAllExternalServers(consola, configPath);
  if (isError(result)) {
    console.error(JSON.stringify(result));
    process.exit(1);
  }

  const internalServerFactory = createInternalServerFactory(consola, result);
  const app = getInternalServer(
    internalServerFactory,
    auditLogger,
    withAuditRequestResponseHandler
  );
  await runInternalServer(consola, 9851, app);
}

main()
  .then(() => {
    const successMsg = 'MCP server started successfully';
    console.log(`[MCP-Shark] ${successMsg}`);;
    consola.info(successMsg);
  })
  .catch(error => {
    const errorMsg = 'Error starting MCP server';
    console.error(`[MCP-Shark] ${errorMsg}:`, error);
    console.error(`[MCP-Shark] Error message: ${error.message}`);
    if (error.stack) {
      console.error(`[MCP-Shark] Error stack:`, error.stack);
    }
    consola.error(errorMsg, error);
    consola.error(`Error message: ${error.message}`);
    if (error.stack) {
      consola.error(`Error stack: ${error.stack}`);
    }
    process.exit(1);
  });
