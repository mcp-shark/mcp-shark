import * as path from 'node:path';
import * as fs from 'node:fs';
import * as os from 'node:os';
import { consola } from 'consola';

import { runAllExternalServers } from './lib/server/external/all.js';
import { isError } from './lib/common/error.js';

import { createInternalServerFactory } from './lib/server/internal/server.js';
import {
  getInternalServer,
  runInternalServer,
} from './lib/server/internal/run.js';
import { initDb } from './lib/db/init.js';
import { getLogger } from './lib/db/logger.js';
import { withAuditRequestResponseHandler } from './lib/auditor/audit.js';

const DB_NAME = 'mcp-shark.sqlite';
// Use MCP_SHARK_DATA_DIR if set (for Electron apps), otherwise use user's home directory
// MCP_SHARK_DATA_DIR is set by Electron to a writable location (user's home directory)
const dataDir =
  process.env.MCP_SHARK_DATA_DIR || path.join(os.homedir(), '.mcp-shark');
const DB_PATH = path.join(dataDir, 'db');
const DB_FILE = path.join(DB_PATH, DB_NAME);

function initAuditLogger(logger) {
  if (!fs.existsSync(DB_FILE)) {
    fs.mkdirSync(DB_PATH, { recursive: true });
    fs.writeFileSync(DB_FILE, '');
  }

  logger.info('Initializing audit logger at', DB_FILE);
  const db = initDb(DB_FILE);
  return getLogger(db);
}

async function main(configPath) {
  consola.level = 'info'; // 'debug';

  const auditLogger = initAuditLogger(consola);
  const result = await runAllExternalServers(consola, configPath);
  if (isError(result)) {
    consola.error(result.error);
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

// Config path can be provided as:
// 1. Command-line argument (when spawned from UI server, especially in Electron)
// 2. Environment variable MCP_SHARK_CONFIG_PATH
// 3. Default: temp/mcps.json relative to current working directory
const configPath =
  process.argv[2] || // Command-line argument (used by UI server)
  process.env.MCP_SHARK_CONFIG_PATH || // Environment variable
  path.join(process.cwd(), 'temp', 'mcps.json'); // Default fallback

// Log startup information to stdout/stderr so it's captured by parent process
console.log('[MCP-Shark] Starting MCP server...');
console.log(`[MCP-Shark] Config path: ${configPath}`);
console.log(`[MCP-Shark] Data directory: ${dataDir}`);
console.log(`[MCP-Shark] Database path: ${DB_FILE}`);
console.log(`[MCP-Shark] Working directory: ${process.cwd()}`);

main(configPath)
  .then(() => {
    const successMsg = 'MCP server started successfully';
    console.log(`[MCP-Shark] ${successMsg}`);
    console.log(`[MCP-Shark] Config path: ${configPath}`);
    console.log(`[MCP-Shark] Data directory: ${dataDir}`);
    console.log(`[MCP-Shark] Database path: ${DB_FILE}`);
    // Also use consola for consistency
    consola.info(successMsg);
    consola.info(`Config path: ${configPath}`);
    consola.info(`Data directory: ${dataDir}`);
    consola.info(`Database path: ${DB_FILE}`);
  })
  .catch(error => {
    const errorMsg = 'Error starting MCP server';
    // Log to stderr for errors
    console.error(`[MCP-Shark] ${errorMsg}:`, error);
    console.error(`[MCP-Shark] Error message: ${error.message}`);
    if (error.stack) {
      console.error(`[MCP-Shark] Error stack:`, error.stack);
    }
    // Also use consola for consistency
    consola.error(errorMsg, error);
    consola.error(`Error message: ${error.message}`);
    if (error.stack) {
      consola.error(`Error stack: ${error.stack}`);
    }
    process.exit(1);
  });
