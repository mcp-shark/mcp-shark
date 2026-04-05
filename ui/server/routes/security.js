import { RuleSourcesController } from '#ui/server/controllers/RuleSourcesController.js';
import { SecurityFindingsController } from '#ui/server/controllers/SecurityFindingsController.js';
import { YaraRulesController } from '#ui/server/controllers/YaraRulesController.js';

/**
 * Create Security routes
 * Routes delegate to controllers which call services
 */
export function createSecurityRoutes(container) {
  const securityDetectionService = container.getService('securityDetection');
  const serverManagementService = container.getService('serverManagement');
  const rulesManagerService = container.getService('rulesManager');
  const yaraEngineService = container.getService('yaraEngine');
  const logger = container.getLibrary('logger');

  const trafficToxicFlowService = container.getService('trafficToxicFlow');
  const findingsController = new SecurityFindingsController(
    securityDetectionService,
    serverManagementService,
    logger,
    trafficToxicFlowService
  );

  const sourcesController = new RuleSourcesController(
    rulesManagerService,
    yaraEngineService,
    logger
  );

  const rulesController = new YaraRulesController(rulesManagerService, logger);

  const router = {};

  // Static rules and scanning (SecurityFindingsController)
  router.getRules = findingsController.getRules;
  router.scanServer = findingsController.scanServer;
  router.scanMultipleServers = findingsController.scanMultipleServers;
  router.analyseRunningServers = findingsController.analyseRunningServers;
  router.getFindings = findingsController.getFindings;
  router.getFinding = findingsController.getFinding;
  router.getSummary = findingsController.getSummary;
  router.getScanHistory = findingsController.getScanHistory;
  router.clearFindings = findingsController.clearFindings;
  router.deleteScanFindings = findingsController.deleteScanFindings;
  router.getTrafficToxicFlows = findingsController.getTrafficToxicFlows;
  router.replayTrafficToxicFlows = findingsController.replayTrafficToxicFlows;

  // YARA engine (RuleSourcesController)
  router.getEngineStatus = sourcesController.getEngineStatus;
  router.loadRulesIntoEngine = sourcesController.loadRulesIntoEngine;

  // Rule sources (RuleSourcesController)
  router.getRuleSources = sourcesController.getRuleSources;
  router.addRuleSource = sourcesController.addRuleSource;
  router.removeRuleSource = sourcesController.removeRuleSource;
  router.syncRuleSource = sourcesController.syncRuleSource;
  router.syncAllRuleSources = sourcesController.syncAllRuleSources;
  router.initializeSources = sourcesController.initializeSources;

  // Community rules (YaraRulesController)
  router.getCommunityRules = rulesController.getCommunityRules;
  router.setRuleEnabled = rulesController.setRuleEnabled;
  router.deleteCommunityRule = rulesController.deleteCommunityRule;
  router.addCustomRule = rulesController.addCustomRule;
  router.updateRule = rulesController.updateRule;
  router.resetPredefinedRules = rulesController.resetPredefinedRules;

  return router;
}
