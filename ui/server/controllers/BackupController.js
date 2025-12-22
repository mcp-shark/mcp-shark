import { StatusCodes } from '#core/constants/index.js';
import { NotFoundError } from '#core/libraries/index.js';
import { handleError, handleValidationError } from '../utils/errorHandler.js';

/**
 * Controller for backup-related HTTP endpoints
 */
export class BackupController {
  constructor(backupService, serverManagementService, logger) {
    this.backupService = backupService;
    this.serverManagementService = serverManagementService;
    this.logger = logger;
  }

  /**
   * Get restore message based on result
   * @private
   */
  _getRestoreMessage(result) {
    if (result.wasPatched && result.repatched) {
      return 'Config file restored from backup and automatically repatched (server is running)';
    }
    if (result.wasPatched && !result.repatched) {
      return 'Config file restored from backup (was patched, but server is not running)';
    }
    return 'Config file restored from backup';
  }

  listBackups = (_req, res) => {
    try {
      const backups = this.backupService.listBackups();
      res.json({ backups });
    } catch (error) {
      handleError(error, res, this.logger, 'Error listing backups');
    }
  };

  viewBackup = (req, res) => {
    try {
      const { backupPath } = req.query;

      if (!backupPath) {
        return handleValidationError('backupPath is required', res, this.logger);
      }

      const result = this.backupService.viewBackup(backupPath);

      if (!result) {
        return handleError(
          new NotFoundError('Backup file not found', null),
          res,
          this.logger,
          'Error viewing backup'
        );
      }

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error viewing backup');
    }
  };

  restoreBackup = (req, res) => {
    try {
      const { backupPath, originalPath } = req.body;

      if (!backupPath) {
        return handleValidationError('backupPath is required', res, this.logger);
      }

      // Check if server is running
      const serverStatus = this.serverManagementService.getServerStatus();
      const serverIsRunning = serverStatus.running;

      const result = this.backupService.restoreBackup(backupPath, originalPath, serverIsRunning);

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'ValidationError',
          message: result.error || 'Failed to restore backup',
        });
      }

      const message = this._getRestoreMessage(result);

      res.json({
        success: true,
        message,
        originalPath: result.originalPath,
        wasPatched: result.wasPatched,
        repatched: result.repatched,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error restoring backup');
    }
  };

  deleteBackup = (req, res) => {
    try {
      const { backupPath } = req.body;

      if (!backupPath) {
        return handleValidationError('backupPath is required', res, this.logger);
      }

      const result = this.backupService.deleteBackup(backupPath);

      if (!result.success) {
        return handleError(
          new NotFoundError(result.error || 'Backup file not found', null),
          res,
          this.logger,
          'Error deleting backup'
        );
      }

      res.json({
        success: true,
        message: 'Backup file deleted successfully',
        backupPath: result.backupPath,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error deleting backup');
    }
  };
}
