import { McpDiscoveryController, ScanController, TokenController } from '#ui/server/controllers';

/**
 * Create Smart Scan routes
 * Routes delegate to controllers which call services
 */
export function createSmartScanRoutes(container) {
  const scanService = container.getService('scan');
  const scanCacheService = container.getService('scanCache');
  const mcpDiscoveryService = container.getService('mcpDiscovery');
  const tokenService = container.getService('token');
  const logger = container.getLibrary('logger');

  const scanController = new ScanController(scanService, scanCacheService, logger);
  const mcpDiscoveryController = new McpDiscoveryController(mcpDiscoveryService, logger);
  const tokenController = new TokenController(tokenService, logger);

  const router = {};

  router.getToken = tokenController.getToken;
  router.saveToken = tokenController.saveToken;
  router.discoverServers = mcpDiscoveryController.discoverServers;
  router.getCachedResults = scanController.getCachedResults;
  router.createScan = scanController.createScan;
  router.getScan = scanController.getScan;
  router.listScans = scanController.listScans;
  router.createBatchScans = scanController.createBatchScans;
  router.clearCache = scanController.clearCache;

  return router;
}
