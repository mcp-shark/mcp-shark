import { HttpStatus } from '#core/constants';

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
      this.logger?.error({ error: error.message }, 'Error listing backups');
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to list backups',
        details: error.message,
      });
    }
  };

  viewBackup = (req, res) => {
    try {
      const { backupPath } = req.query;

      if (!backupPath) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: 'backupPath is required' });
      }

      const result = this.backupService.viewBackup(backupPath);

      if (!result) {
        return res.status(HttpStatus.NOT_FOUND).json({
          error: 'Backup file not found',
          path: backupPath,
        });
      }

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Error viewing backup');
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to read backup file',
        details: error.message,
      });
    }
  };

  restoreBackup = (req, res) => {
    try {
      const { backupPath, originalPath } = req.body;

      if (!backupPath) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: 'backupPath is required' });
      }

      const result = this.backupService.restoreBackup(backupPath, originalPath);

      if (!result.success) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: result.error || 'Failed to restore backup',
        });
      }

      res.json({
        success: true,
        message: 'Config file restored from backup',
        originalPath: result.originalPath,
      });
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Error restoring backup');
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to restore backup',
        details: error.message,
      });
    }
  };

  deleteBackup = (req, res) => {
    try {
      const { backupPath } = req.body;

      if (!backupPath) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: 'backupPath is required' });
      }

      const result = this.backupService.deleteBackup(backupPath);

      if (!result.success) {
        return res.status(HttpStatus.NOT_FOUND).json({
          error: result.error || 'Backup file not found',
        });
      }

      res.json({
        success: true,
        message: 'Backup file deleted successfully',
        backupPath: result.backupPath,
      });
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Error deleting backup');
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to delete backup',
        details: error.message,
      });
    }
  };
}
