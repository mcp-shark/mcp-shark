import { ConfigController } from '#ui/server/controllers';
import { createBackupRoutes } from './backups/index.js';

/**
 * Create config routes
 * Routes delegate to ConfigController which calls ConfigService
 */
export function createConfigRoutes(container) {
  const configService = container.getService('config');
  const logger = container.getLibrary('logger');
  const configController = new ConfigController(configService, logger);

  const router = {};

  // Delegate to controller
  router.extractServices = configController.extractServices;
  router.readConfig = configController.readConfig;
  router.detectConfig = configController.detectConfig;

  // Delegate backup routes to separate module
  const backupRoutes = createBackupRoutes();
  router.listBackups = backupRoutes.listBackups;
  router.restoreBackup = backupRoutes.restoreBackup;
  router.viewBackup = backupRoutes.viewBackup;
  router.deleteBackup = backupRoutes.deleteBackup;

  return router;
}
