import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { getDatabaseFile, getWorkingDirectory } from '#common/configs';
import { getScanResultsDirectory } from '#ui/server/utils/scan-cache/directory.js';

/**
 * Service for application settings
 * Handles retrieving application configuration and paths
 */
export class SettingsService {
  constructor(tokenService, backupService, logger) {
    this.tokenService = tokenService;
    this.backupService = backupService;
    this.logger = logger;
  }

  /**
   * Get all settings
   */
  getSettings() {
    const homeDir = homedir();
    const workingDir = getWorkingDirectory();
    const databasePath = getDatabaseFile();
    const scanResultsDir = getScanResultsDirectory();
    const tokenMetadata = this.tokenService.getTokenMetadata();

    const cursorConfigPath = join(homeDir, '.cursor', 'mcp.json');
    const windsurfConfigPath = join(homeDir, '.codeium', 'windsurf', 'mcp_config.json');

    const cursorBackupDir = join(homeDir, '.cursor');
    const windsurfBackupDir = join(homeDir, '.codeium', 'windsurf');

    const toDisplayPath = (absolutePath) => {
      return absolutePath.replace(homeDir, '~');
    };

    const getBackupCount = () => {
      try {
        const backupDirs = [cursorBackupDir, windsurfBackupDir];
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

        const commonPaths = [cursorConfigPath, windsurfConfigPath];
        const oldFormatCount = commonPaths.reduce((count, configPath) => {
          if (existsSync(`${configPath}.backup`)) {
            return count + 1;
          }
          return count;
        }, 0);

        return newFormatCount + oldFormatCount;
      } catch (error) {
        this.logger?.error({ error: error.message }, 'Error counting backups');
        return 0;
      }
    };

    return {
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
          absolute: tokenMetadata.path,
          display: toDisplayPath(tokenMetadata.path),
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
  }
}
