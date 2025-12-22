import { BackupController } from '#ui/server/controllers';

/**
 * Create backup routes
 * Routes delegate to BackupController which calls BackupService
 */
export function createBackupRoutes(container) {
  const backupService = container.getService('backup');
  const serverManagementService = container.getService('serverManagement');
  const logger = container.getLibrary('logger');
  const backupController = new BackupController(backupService, serverManagementService, logger);

  const router = {};

  router.listBackups = backupController.listBackups;
  router.restoreBackup = backupController.restoreBackup;
  router.viewBackup = backupController.viewBackup;
  router.deleteBackup = backupController.deleteBackup;

  return router;
}
