/**
 * Service for handling config patching operations
 * Handles checking if config is patched, restoring original, and repatching
 */
export class ConfigPatchingService {
  /**
   * @param {ConfigService} configService - Config service instance
   * @param {BackupService} backupService - Backup service instance
   * @param {object} logger - Logger instance
   */
  constructor(configService, backupService, logger) {
    this.configService = configService;
    this.backupService = backupService;
    this.logger = logger;
  }

  /**
   * Patch config file, restoring original first if already patched
   * @param {string} filePath - Path to config file
   * @param {object} patchedConfig - Config object to write (already patched)
   * @returns {{wasPatched: boolean, restored: boolean, warning?: string}}
   */
  patchConfigFile(filePath, patchedConfig) {
    const resolvedPath = this.configService.fileService.resolveFilePath(filePath);
    const isPatched = this.configService.isFilePatched(resolvedPath);

    if (!isPatched) {
      // Not patched, just write the patched config
      this.configService.writeConfigAsJson(resolvedPath, patchedConfig);
      return { wasPatched: false, restored: false };
    }

    // Config is already patched - restore original first
    this.logger?.warn(
      { filePath: resolvedPath },
      'Config file is already patched, restoring original before repatching'
    );

    let restored = false;
    let warning = 'Config was already patched. Restored original and repatched.';

    // Try to restore from in-memory backup first
    restored = this.configService.restoreOriginalConfig();

    // If that didn't work, use BackupService to find and restore from backup file
    if (!restored) {
      const restoreResult = this._restoreFromBackupFile(resolvedPath);
      if (restoreResult.success) {
        restored = true;
      }
    }

    if (!restored) {
      this.logger?.warn(
        { filePath: resolvedPath },
        'Could not restore original config - may cause issues'
      );
      warning = 'Config was patched but could not restore original. Proceeding anyway.';
    }

    // Now write the patched config
    this.configService.writeConfigAsJson(resolvedPath, patchedConfig);

    return { wasPatched: true, restored, warning };
  }

  /**
   * Restore config from backup file using BackupService
   * @private
   * @param {string} filePath - Path to config file to restore
   * @returns {{success: boolean}}
   */
  _restoreFromBackupFile(filePath) {
    const backups = this.backupService.listBackups();
    const matchingBackup = backups.find((backup) => backup.originalPath === filePath);

    if (!matchingBackup) {
      return { success: false };
    }

    this.logger?.info(
      { backupPath: matchingBackup.backupPath },
      'Found backup file, restoring from backup'
    );

    const restoreResult = this.backupService.restoreBackup(
      matchingBackup.backupPath,
      filePath,
      false
    );

    return { success: restoreResult.success };
  }
}
