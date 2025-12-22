import * as fs from 'node:fs';
import { homedir } from 'node:os';
import * as path from 'node:path';

/**
 * Service for backup operations
 * Handles creating, restoring, listing, and deleting backups
 */
export class BackupService {
  constructor(configService, logger) {
    this.configService = configService;
    this.logger = logger;
  }

  /**
   * List all backups
   */
  listBackups() {
    const backups = [];
    const homeDir = homedir();

    const commonPaths = [
      path.join(homeDir, '.cursor', 'mcp.json'),
      path.join(homeDir, '.codeium', 'windsurf', 'mcp_config.json'),
    ];

    const backupDirs = [path.join(homeDir, '.cursor'), path.join(homeDir, '.codeium', 'windsurf')];

    // Find backups with new format: .mcp.json-mcpshark.<datetime>.json
    for (const dir of backupDirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        const matchingFiles = files.filter((file) => {
          return /^\.(.+)-mcpshark\.\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.json$/.test(file);
        });
        for (const file of matchingFiles) {
          const match = file.match(/^\.(.+)-mcpshark\./);
          if (match) {
            const originalBasename = match[1];
            const originalPath = path.join(dir, originalBasename);
            const backupPath = path.join(dir, file);
            const stats = fs.statSync(backupPath);
            backups.push({
              originalPath: originalPath,
              backupPath: backupPath,
              createdAt: stats.birthtime.toISOString(),
              modifiedAt: stats.mtime.toISOString(),
              size: stats.size,
              displayPath: originalPath.replace(homeDir, '~'),
              backupFileName: file,
            });
          }
        }
      }
    }

    // Also check for old .backup format for backward compatibility
    for (const configPath of commonPaths) {
      const backupPath = `${configPath}.backup`;
      if (fs.existsSync(backupPath)) {
        const stats = fs.statSync(backupPath);
        backups.push({
          originalPath: configPath,
          backupPath: backupPath,
          createdAt: stats.birthtime.toISOString(),
          modifiedAt: stats.mtime.toISOString(),
          size: stats.size,
          displayPath: configPath.replace(homeDir, '~'),
          backupFileName: path.basename(backupPath),
        });
      }
    }

    // Sort by modifiedAt (latest first)
    return backups.sort(
      (a, b) => new Date(b.modifiedAt || b.createdAt) - new Date(a.modifiedAt || a.createdAt)
    );
  }

  /**
   * View backup content
   */
  viewBackup(backupPath) {
    const resolvedBackupPath = this.configService.resolveFilePath(backupPath);

    if (!fs.existsSync(resolvedBackupPath)) {
      return null;
    }

    const content = fs.readFileSync(resolvedBackupPath, 'utf-8');
    const parsed = this.configService.tryParseJson(content);
    const stats = fs.statSync(resolvedBackupPath);
    const homeDir = homedir();

    return {
      backupPath: resolvedBackupPath,
      displayPath: resolvedBackupPath.replace(homeDir, '~'),
      content: content,
      parsed: parsed,
      createdAt: stats.birthtime.toISOString(),
      modifiedAt: stats.mtime.toISOString(),
      size: stats.size,
    };
  }

  /**
   * Repatch config if it was patched and server is running
   * @private
   */
  _repatchIfNeeded(wasPatched, serverIsRunning, config, targetPath) {
    if (wasPatched && serverIsRunning && config) {
      try {
        // Repatch the restored config
        const repatchedConfig = this.configService.updateConfigForMcpShark(config);
        this.configService.writeConfigAsJson(targetPath, repatchedConfig);
        this.logger?.info(
          { path: targetPath },
          'Repatched config after restore (server is running)'
        );
        return true;
      } catch (error) {
        this.logger?.error(
          { error: error.message, path: targetPath },
          'Failed to repatch config after restore'
        );
        // Continue anyway - at least the restore succeeded
        return false;
      }
    }
    return false;
  }

  /**
   * Determine target path for restore
   */
  _determineTargetPath(originalPath, backupPath) {
    if (originalPath) {
      return this.configService.resolveFilePath(originalPath);
    }

    // Try to extract from backup filename
    if (backupPath.endsWith('.backup')) {
      return backupPath.replace('.backup', '');
    }

    // New format: .mcp.json-mcpshark.<datetime>.json
    const match = path.basename(backupPath).match(/^\.(.+)-mcpshark\./);
    if (match) {
      const originalBasename = match[1];
      return path.join(path.dirname(backupPath), originalBasename);
    }

    return null;
  }

  /**
   * Restore backup
   * @param {string} backupPath - Path to backup file
   * @param {string} originalPath - Path to original file (optional, will be determined from backup)
   * @param {boolean} serverIsRunning - Whether MCP Shark server is currently running
   * @returns {{success: boolean, error?: string, originalPath?: string, wasPatched?: boolean, repatched?: boolean}}
   */
  restoreBackup(backupPath, originalPath, serverIsRunning = false) {
    const resolvedBackupPath = this.configService.resolveFilePath(backupPath);

    if (!fs.existsSync(resolvedBackupPath)) {
      return { success: false, error: 'Backup file not found' };
    }

    const targetPath = this._determineTargetPath(originalPath, resolvedBackupPath);
    if (!targetPath) {
      return { success: false, error: 'Could not determine original file path' };
    }

    // Read backup content and check if it was patched
    const backupContent = fs.readFileSync(resolvedBackupPath, 'utf8');
    const parseResult = this.configService.parseJsonConfig(backupContent, resolvedBackupPath);
    const wasPatched = parseResult.config && this.configService.isConfigPatched(parseResult.config);

    // Restore the backup
    fs.writeFileSync(targetPath, backupContent);

    this.logger?.info({ path: targetPath, wasPatched }, 'Restored config from backup');

    // If the backup was patched and server is running, repatch it
    const repatched = this._repatchIfNeeded(
      wasPatched,
      serverIsRunning,
      parseResult.config,
      targetPath
    );

    const homeDir = homedir();
    return {
      success: true,
      originalPath: targetPath.replace(homeDir, '~'),
      wasPatched,
      repatched,
    };
  }

  /**
   * Delete backup
   */
  deleteBackup(backupPath) {
    const resolvedBackupPath = this.configService.resolveFilePath(backupPath);

    if (!fs.existsSync(resolvedBackupPath)) {
      return { success: false, error: 'Backup file not found' };
    }

    fs.unlinkSync(resolvedBackupPath);

    this.logger?.info({ path: resolvedBackupPath }, 'Deleted backup');

    const homeDir = homedir();
    return {
      success: true,
      backupPath: resolvedBackupPath.replace(homeDir, '~'),
    };
  }
}
