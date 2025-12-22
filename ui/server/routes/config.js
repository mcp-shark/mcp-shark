import { ConfigController } from '#ui/server/controllers/index.js';

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

  return router;
}
