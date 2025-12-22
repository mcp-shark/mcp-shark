import { LogController } from '#ui/server/controllers';

/**
 * Create logs routes
 * Routes delegate to LogController which calls LogService
 */
export function createLogsRoutes(container, mcpSharkLogs) {
  const logService = container.getService('log');
  const logger = container.getLibrary('logger');
  logService.initialize(mcpSharkLogs);
  const logController = new LogController(logService, logger);

  const router = {};

  router.getLogs = logController.getLogs;
  router.clearLogs = logController.clearLogs;
  router.exportLogs = logController.exportLogs;

  return router;
}
