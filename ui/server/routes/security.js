import { SecurityController } from '#ui/server/controllers/SecurityController.js';

/**
 * Create Security routes
 * Routes delegate to controllers which call services
 */
export function createSecurityRoutes(container) {
  const securityDetectionService = container.getService('securityDetection');
  const mcpDiscoveryService = container.getService('mcpDiscovery');
  const logger = container.getLibrary('logger');

  const securityController = new SecurityController(
    securityDetectionService,
    mcpDiscoveryService,
    logger
  );

  const router = {};

  router.getRules = securityController.getRules;
  router.scanServer = securityController.scanServer;
  router.scanMultipleServers = securityController.scanMultipleServers;
  router.discoverAndScan = securityController.discoverAndScan;
  router.getFindings = securityController.getFindings;
  router.getFinding = securityController.getFinding;
  router.getSummary = securityController.getSummary;
  router.clearFindings = securityController.clearFindings;
  router.deleteScanFindings = securityController.deleteScanFindings;

  return router;
}
