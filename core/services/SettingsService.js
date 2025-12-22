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
   * Convert absolute path to display path (replace home with ~)
   */
  _toDisplayPath(homeDir, absolutePath) {
    return absolutePath.replace(homeDir, '~');
  }

  /**
   * Get backup count from backup directories
   */
  _getBackupCount(cursorBackupDir, windsurfBackupDir, cursorConfigPath, windsurfConfigPath) {
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

    return {
      paths: {
        workingDirectory: {
          absolute: workingDir,
          display: this._toDisplayPath(homeDir, workingDir),
          exists: existsSync(workingDir),
        },
        database: {
          absolute: databasePath,
          display: this._toDisplayPath(homeDir, databasePath),
          exists: existsSync(databasePath),
        },
        smartScanResults: {
          absolute: scanResultsDir,
          display: this._toDisplayPath(homeDir, scanResultsDir),
          exists: existsSync(scanResultsDir),
        },
        smartScanToken: {
          absolute: tokenMetadata.path,
          display: this._toDisplayPath(homeDir, tokenMetadata.path),
          exists: tokenMetadata.exists,
        },
        backupDirectories: {
          cursor: {
            absolute: cursorBackupDir,
            display: this._toDisplayPath(homeDir, cursorBackupDir),
            exists: existsSync(cursorBackupDir),
          },
          windsurf: {
            absolute: windsurfBackupDir,
            display: this._toDisplayPath(homeDir, windsurfBackupDir),
            exists: existsSync(windsurfBackupDir),
          },
        },
        configFiles: {
          cursor: {
            absolute: cursorConfigPath,
            display: this._toDisplayPath(homeDir, cursorConfigPath),
            exists: existsSync(cursorConfigPath),
          },
          windsurf: {
            absolute: windsurfConfigPath,
            display: this._toDisplayPath(homeDir, windsurfConfigPath),
            exists: existsSync(windsurfConfigPath),
          },
        },
      },
      smartScan: {
        token: tokenMetadata.token,
        tokenPath: {
          absolute: tokenMetadata.path,
          display: this._toDisplayPath(homeDir, tokenMetadata.path),
        },
        tokenUpdatedAt: tokenMetadata.updatedAt,
        tokenExists: tokenMetadata.exists,
      },
      database: {
        path: {
          absolute: databasePath,
          display: this._toDisplayPath(homeDir, databasePath),
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
            display: this._toDisplayPath(homeDir, cursorBackupDir),
          },
          {
            absolute: windsurfBackupDir,
            display: this._toDisplayPath(homeDir, windsurfBackupDir),
          },
        ],
        count: this._getBackupCount(cursorBackupDir, windsurfBackupDir, cursorConfigPath, windsurfConfigPath),
      },
    };
  }
}
