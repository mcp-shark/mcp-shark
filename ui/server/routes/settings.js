import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { getDatabaseFile, getWorkingDirectory } from '#common/configs';
import logger from '../utils/logger.js';
import { getScanResultsDirectory } from '../utils/scan-cache/directory.js';

const SMART_SCAN_TOKEN_NAME = 'smart-scan-token.json';

function getSmartScanTokenPath() {
  return join(getWorkingDirectory(), SMART_SCAN_TOKEN_NAME);
}

function getTokenMetadata() {
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

function getBackupCount() {
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

function toDisplayPath(absolutePath) {
  const homeDir = homedir();
  return absolutePath.replace(homeDir, '~');
}

export function createSettingsRoutes() {
  const router = {};

  router.getSettings = (_req, res) => {
    try {
      const homeDir = homedir();
      const workingDir = getWorkingDirectory();
      const databasePath = getDatabaseFile();
      const scanResultsDir = getScanResultsDirectory();
      const tokenPath = getSmartScanTokenPath();
      const tokenMetadata = getTokenMetadata();

      const cursorConfigPath = join(homeDir, '.cursor', 'mcp.json');
      const windsurfConfigPath = join(homeDir, '.codeium', 'windsurf', 'mcp_config.json');

      const cursorBackupDir = join(homeDir, '.cursor');
      const windsurfBackupDir = join(homeDir, '.codeium', 'windsurf');

      const settings = {
        paths: {
          workingDirectory: {
            absolute: workingDir,
            display: toDisplayPath(workingDir),
            exists: existsSync(workingDir),
          },
          database: {
            absolute: databasePath,
            display: toDisplayPath(databasePath),
            exists: existsSync(databasePath),
          },
          smartScanResults: {
            absolute: scanResultsDir,
            display: toDisplayPath(scanResultsDir),
            exists: existsSync(scanResultsDir),
          },
          smartScanToken: {
            absolute: tokenPath,
            display: toDisplayPath(tokenPath),
            exists: tokenMetadata.exists,
          },
          backupDirectories: {
            cursor: {
              absolute: cursorBackupDir,
              display: toDisplayPath(cursorBackupDir),
              exists: existsSync(cursorBackupDir),
            },
            windsurf: {
              absolute: windsurfBackupDir,
              display: toDisplayPath(windsurfBackupDir),
              exists: existsSync(windsurfBackupDir),
            },
          },
          configFiles: {
            cursor: {
              absolute: cursorConfigPath,
              display: toDisplayPath(cursorConfigPath),
              exists: existsSync(cursorConfigPath),
            },
            windsurf: {
              absolute: windsurfConfigPath,
              display: toDisplayPath(windsurfConfigPath),
              exists: existsSync(windsurfConfigPath),
            },
          },
        },
        smartScan: {
          token: tokenMetadata.token,
          tokenPath: {
            absolute: tokenMetadata.path,
            display: toDisplayPath(tokenMetadata.path),
          },
          tokenUpdatedAt: tokenMetadata.updatedAt,
          tokenExists: tokenMetadata.exists,
        },
        database: {
          path: {
            absolute: databasePath,
            display: toDisplayPath(databasePath),
          },
          exists: existsSync(databasePath),
        },
        system: {
          platform: process.platform,
          homeDirectory: {
            absolute: homeDir,
            display: '~',
          },
        },
        backups: {
          directories: [
            {
              absolute: cursorBackupDir,
              display: toDisplayPath(cursorBackupDir),
            },
            {
              absolute: windsurfBackupDir,
              display: toDisplayPath(windsurfBackupDir),
            },
          ],
          count: getBackupCount(),
        },
      };

      res.json(settings);
    } catch (error) {
      logger.error({ error: error.message }, 'Error getting settings');
      res.status(500).json({
        error: 'Failed to get settings',
        details: error.message,
      });
    }
  };

  return router;
}
