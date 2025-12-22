import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import os, { homedir } from 'node:os';
import { join } from 'node:path';
import { getModelsDirectory, getWorkingDirectory } from '#common/configs';
import logger from './logger.js';

const SMART_SCAN_TOKEN_NAME = 'smart-scan-token.json';

export function getSmartScanTokenPath() {
  return join(getWorkingDirectory(), SMART_SCAN_TOKEN_NAME);
}

export function getTokenMetadata() {
  try {
    const tokenPath = getSmartScanTokenPath();
    if (existsSync(tokenPath)) {
      const content = readFileSync(tokenPath, 'utf8');
      const data = JSON.parse(content);
      const stats = statSync(tokenPath);
      return {
        token: data.token || null,
        updatedAt: data.updatedAt || stats.mtime.toISOString(),
        path: tokenPath,
        exists: true,
      };
    }
    return {
      token: null,
      updatedAt: null,
      path: tokenPath,
      exists: false,
    };
  } catch (error) {
    logger.error({ error: error.message }, 'Error reading Smart Scan token metadata');
    return {
      token: null,
      updatedAt: null,
      path: getSmartScanTokenPath(),
      exists: false,
    };
  }
}

export function getBackupCount() {
  try {
    const homeDir = homedir();
    const backupDirs = [join(homeDir, '.cursor'), join(homeDir, '.codeium', 'windsurf')];

    const newFormatCount = backupDirs.reduce((count, dir) => {
      if (existsSync(dir)) {
        const files = readdirSync(dir);
        const matchingFiles = files.filter((file) => {
          return /^\.(.+)-mcpshark\.\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.json$/.test(file);
        });
        return count + matchingFiles.length;
      }
      return count;
    }, 0);

    // Also count old .backup format
    const commonPaths = [
      join(homeDir, '.cursor', 'mcp.json'),
      join(homeDir, '.codeium', 'windsurf', 'mcp_config.json'),
    ];
    const oldFormatCount = commonPaths.reduce((count, configPath) => {
      if (existsSync(`${configPath}.backup`)) {
        return count + 1;
      }
      return count;
    }, 0);

    return newFormatCount + oldFormatCount;
  } catch (error) {
    logger.error({ error: error.message }, 'Error counting backups');
    return 0;
  }
}

export function toDisplayPath(absolutePath) {
  const homeDir = homedir();
  return absolutePath.replace(homeDir, '~');
}

export function getSystemMemoryInfo() {
  const bytesToGb = (bytes) => {
    return Math.round((bytes / 1024 ** 3) * 10) / 10;
  };

  return {
    totalGb: bytesToGb(os.totalmem()),
    freeGb: bytesToGb(os.freemem()),
  };
}

export function getAvailableModels() {
  try {
    const modelsDirectory = getModelsDirectory();
    if (!existsSync(modelsDirectory)) {
      return [];
    }

    return readdirSync(modelsDirectory)
      .filter((file) => file.toLowerCase().endsWith('.gguf'))
      .map((file) => {
        const filePath = join(modelsDirectory, file);
        const stats = statSync(filePath);
        return {
          name: file,
          sizeBytes: stats.size,
          modifiedAt: stats.mtime.toISOString(),
        };
      })
      .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
  } catch (_error) {
    return [];
  }
}
