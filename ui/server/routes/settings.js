import { SettingsController } from '#ui/server/controllers/index.js';

/**
 * Create settings routes
 * Routes delegate to SettingsController which calls SettingsService
 */
export function createSettingsRoutes(container) {
  const settingsService = container.getService('settings');
  const logger = container.getLibrary('logger');
  const settingsController = new SettingsController(settingsService, logger);

  const router = {};

  router.getSettings = settingsController.getSettings;

  return router;
}
