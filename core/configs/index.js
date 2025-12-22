import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export * from './codex.js';

const WORKING_DIRECTORY_NAME = '.mcp-shark';
const MCP_CONFIG_NAME = 'mcps.json';
const APP_DB_DIR_NAME = 'db';
const APP_DB_FILE_NAME = 'mcp-shark.sqlite';
const HELP_STATE_NAME = 'help-state.json';

export function getWorkingDirectory() {
  return join(homedir(), WORKING_DIRECTORY_NAME);
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

export function getHelpStatePath() {
  return join(getWorkingDirectory(), HELP_STATE_NAME);
}

export function readHelpState() {
  try {
    const helpStatePath = getHelpStatePath();
    if (existsSync(helpStatePath)) {
      const content = readFileSync(helpStatePath, 'utf8');
      const state = JSON.parse(content);
      // Ensure we have the expected structure
      return {
        dismissed: state.dismissed || false,
        tourCompleted: state.tourCompleted || false,
        dismissedAt: state.dismissedAt || null,
        version: state.version || '1.0.0',
      };
    }
    return {
      dismissed: false,
      tourCompleted: false,
      dismissedAt: null,
      version: '1.0.0',
    };
  } catch (_error) {
    // Error reading help state - return defaults
    return {
      dismissed: false,
      tourCompleted: false,
      dismissedAt: null,
      version: '1.0.0',
    };
  }
}

export function writeHelpState(state) {
  try {
    const helpStatePath = getHelpStatePath();
    prepareAppDataSpaces(); // Ensure directory exists

    // Merge with existing state to preserve other fields
    const existingState = readHelpState();
    const newState = {
      ...existingState,
      ...state,
      dismissedAt:
        state.dismissed || state.tourCompleted
          ? new Date().toISOString()
          : existingState.dismissedAt,
      version: '1.0.0',
    };

    writeFileSync(helpStatePath, JSON.stringify(newState, null, 2));
    return true;
  } catch (_error) {
    return false;
  }
}
