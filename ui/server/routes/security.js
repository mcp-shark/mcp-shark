import { SecurityController } from '#ui/server/controllers/SecurityController.js';

/**
 * Create Security routes
 * Routes delegate to controllers which call services
 */
export function createSecurityRoutes(container) {
  const securityDetectionService = container.getService('securityDetection');
  const mcpDiscoveryService = container.getService('mcpDiscovery');
  const rulesManagerService = container.getService('rulesManager');
  const yaraEngineService = container.getService('yaraEngine');
  const logger = container.getLibrary('logger');

  const securityController = new SecurityController(
    securityDetectionService,
    mcpDiscoveryService,
    rulesManagerService,
    yaraEngineService,
    logger
  );

  const router = {};

  // Static rules and scanning
  router.getRules = securityController.getRules;
  router.scanServer = securityController.scanServer;
  router.scanMultipleServers = securityController.scanMultipleServers;
  router.discoverAndScan = securityController.discoverAndScan;
  router.getFindings = securityController.getFindings;
  router.getFinding = securityController.getFinding;
  router.getSummary = securityController.getSummary;
  router.clearFindings = securityController.clearFindings;
  router.deleteScanFindings = securityController.deleteScanFindings;

  // YARA engine
  router.getEngineStatus = securityController.getEngineStatus;
  router.loadRulesIntoEngine = securityController.loadRulesIntoEngine;

  // Rule sources
  router.getRuleSources = securityController.getRuleSources;
  router.addRuleSource = securityController.addRuleSource;
  router.removeRuleSource = securityController.removeRuleSource;
  router.syncRuleSource = securityController.syncRuleSource;
  router.syncAllRuleSources = securityController.syncAllRuleSources;
  router.initializeSources = securityController.initializeSources;

  // Community rules
  router.getCommunityRules = securityController.getCommunityRules;
  router.setRuleEnabled = securityController.setRuleEnabled;
  router.deleteCommunityRule = securityController.deleteCommunityRule;
  router.addCustomRule = securityController.addCustomRule;

  return router;
}
