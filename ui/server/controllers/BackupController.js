import { StatusCodes } from '#core/constants';
import { NotFoundError } from '#core/libraries';
import { handleError, handleValidationError } from '../utils/errorHandler.js';

/**
 * Controller for backup-related HTTP endpoints
 */
export class BackupController {
  constructor(backupService, logger) {
    this.backupService = backupService;
    this.logger = logger;
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

      const result = this.backupService.restoreBackup(backupPath, originalPath);

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'ValidationError',
          message: result.error || 'Failed to restore backup',
        });
      }

      res.json({
        success: true,
        message: 'Config file restored from backup',
        originalPath: result.originalPath,
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
