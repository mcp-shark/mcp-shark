import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { Environment } from './environment.js';

export { Environment } from './environment.js';

const MCP_CONFIG_NAME = 'mcps.json';
const APP_DB_DIR_NAME = 'db';
const APP_DB_FILE_NAME = 'mcp-shark.sqlite';

export function getWorkingDirectory() {
  return Environment.getMcpSharkHome();
}

export function getDatabasePath() {
  return join(getWorkingDirectory(), APP_DB_DIR_NAME);
}

export function getDatabaseFile() {
  return join(getDatabasePath(), APP_DB_FILE_NAME);
}

export function createWorkingDirectorySpaces() {
  const workingDirectory = getWorkingDirectory();
  if (!existsSync(workingDirectory)) {
    mkdirSync(workingDirectory, { recursive: true });
  }
}

export function createDatabaseSpaces() {
  createWorkingDirectorySpaces();
  const databasePath = getDatabasePath();
  if (!existsSync(databasePath)) {
    mkdirSync(databasePath, { recursive: true });
    const databaseFile = getDatabaseFile();
    if (!existsSync(databaseFile)) {
      writeFileSync(databaseFile, '');
    }
  }
}

export function getMcpConfigPath() {
  return join(getWorkingDirectory(), MCP_CONFIG_NAME);
}

export function prepareAppDataSpaces() {
  createWorkingDirectorySpaces();
  createDatabaseSpaces();
}

/**
 * Ensure directory exists for a given file path
 * Creates parent directory if it doesn't exist
 * @param {string} filePath - Full path to a file
 */
export function ensureDirectoryExists(filePath) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}
