import { ServerManagementController } from '#ui/server/controllers';
import { getServers } from './servers.js';

/**
 * Create composite routes
 * Routes delegate to controllers which call services
 */
export function createCompositeRoutes(
  container,
  getMcpSharkProcess,
  setMcpSharkProcess,
  mcpSharkLogs,
  _broadcastLogUpdate
) {
  const serverManagementService = container.getService('serverManagement');
  const configService = container.getService('config');
  const logService = container.getService('log');
  const backupService = container.getService('backup');
  const logger = container.getLibrary('logger');

  // Initialize log service with the log array
  logService.initialize(mcpSharkLogs);

  // Set server instance getter/setter
  const originalGetInstance =
    serverManagementService.getServerInstance.bind(serverManagementService);
  serverManagementService.getServerInstance = () => {
    return getMcpSharkProcess() || originalGetInstance();
  };
  serverManagementService.setServerInstance = (instance) => {
    setMcpSharkProcess(instance);
    serverManagementService.serverInstance = instance;
  };

  const serverManagementController = new ServerManagementController(
    serverManagementService,
    configService,
    logService,
    backupService,
    logger
  );

  const router = {};

  router.setup = serverManagementController.setup;
  router.stop = serverManagementController.stop;
  router.getStatus = serverManagementController.getStatus;
  router.getServers = getServers(container);

  return router;
}
