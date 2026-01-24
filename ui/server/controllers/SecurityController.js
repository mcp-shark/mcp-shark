import { StatusCodes } from '#core/constants/index.js';
import { handleError, handleValidationError } from '../utils/errorHandler.js';

/**
 * Controller for Security Detection HTTP endpoints
 */
export class SecurityController {
  constructor(
    securityDetectionService,
    mcpDiscoveryService,
    rulesManagerService,
    yaraEngineService,
    logger
  ) {
    this.securityService = securityDetectionService;
    this.mcpDiscoveryService = mcpDiscoveryService;
    this.rulesManager = rulesManagerService;
    this.yaraEngine = yaraEngineService;
    this.logger = logger;
  }

  /**
   * Get all security rules metadata
   */
  getRules = (_req, res) => {
    try {
      const rules = this.securityService.getRules();
      return res.json({
        success: true,
        rules,
        count: rules.length,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error getting security rules');
    }
  };

  /**
   * Scan a single MCP server configuration
   */
  scanServer = async (req, res) => {
    try {
      const { serverConfig } = req.body;

      if (!serverConfig) {
        return handleValidationError('Server configuration is required', res, this.logger);
      }

      const result = this.securityService.scanServerConfig(serverConfig);
      return res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error scanning server');
    }
  };

  /**
   * Scan multiple MCP servers
   */
  scanMultipleServers = async (req, res) => {
    try {
      const { servers } = req.body;

      if (!servers || !Array.isArray(servers) || servers.length === 0) {
        return handleValidationError('Servers array is required', res, this.logger);
      }

      const result = this.securityService.scanMultipleServers(servers);
      return res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error scanning multiple servers');
    }
  };

  /**
   * Discover and scan all configured MCP servers
   */
  discoverAndScan = async (_req, res) => {
    try {
      const discoveryResult = await this.mcpDiscoveryService.discoverAllServers();

      if (!discoveryResult.success) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: 'Failed to discover MCP servers',
          details: discoveryResult.errors,
        });
      }

      const servers = discoveryResult.servers || [];

      if (servers.length === 0) {
        return res.json({
          success: true,
          message: 'No MCP servers discovered',
          serversScanned: 0,
          totalFindings: 0,
          results: [],
        });
      }

      const result = this.securityService.scanMultipleServers(servers);
      return res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error discovering and scanning servers');
    }
  };

  /**
   * Get findings with filters
   */
  getFindings = (req, res) => {
    try {
      const filters = {
        severity: req.query.severity,
        owasp_id: req.query.owasp_id,
        server_name: req.query.server_name,
        finding_type: req.query.finding_type,
        scan_id: req.query.scan_id,
        rule_id: req.query.rule_id,
        limit: req.query.limit ? Number.parseInt(req.query.limit, 10) : 100,
        offset: req.query.offset ? Number.parseInt(req.query.offset, 10) : 0,
      };

      const findings = this.securityService.getFindings(filters);
      const count = this.securityService.getFindingsCount(filters);

      return res.json({
        success: true,
        findings,
        count,
        limit: filters.limit,
        offset: filters.offset,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error getting findings');
    }
  };

  /**
   * Get a single finding by ID
   */
  getFinding = (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return handleValidationError('Finding ID is required', res, this.logger);
      }

      const finding = this.securityService.getFindingById(Number.parseInt(id, 10));

      if (!finding) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          error: 'Finding not found',
        });
      }

      return res.json({
        success: true,
        finding,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error getting finding');
    }
  };

  /**
   * Get summary statistics
   */
  getSummary = (_req, res) => {
    try {
      const summary = this.securityService.getSummary();
      return res.json({
        success: true,
        summary,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error getting security summary');
    }
  };

  /**
   * Clear all findings
   */
  clearFindings = (_req, res) => {
    try {
      const deletedCount = this.securityService.clearAllFindings();
      return res.json({
        success: true,
        message: `Cleared ${deletedCount} finding${deletedCount !== 1 ? 's' : ''}`,
        deletedCount,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error clearing findings');
    }
  };

  /**
   * Delete findings for a specific scan
   */
  deleteScanFindings = (req, res) => {
    try {
      const { scanId } = req.params;

      if (!scanId) {
        return handleValidationError('Scan ID is required', res, this.logger);
      }

      const deletedCount = this.securityService.deleteScanFindings(scanId);
      return res.json({
        success: true,
        message: `Deleted ${deletedCount} finding${deletedCount !== 1 ? 's' : ''} for scan ${scanId}`,
        deletedCount,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error deleting scan findings');
    }
  };

  // =====================
  // Community Rules Endpoints
  // =====================

  /**
   * Get YARA engine status
   */
  getEngineStatus = (_req, res) => {
    try {
      const status = this.yaraEngine.getStatus();
      return res.json({
        success: true,
        ...status,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error getting engine status');
    }
  };

  /**
   * Get all rule sources
   */
  getRuleSources = (_req, res) => {
    try {
      const sources = this.rulesManager.getSources();
      return res.json({
        success: true,
        sources,
        count: sources.length,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error getting rule sources');
    }
  };

  /**
   * Add a new rule source
   */
  addRuleSource = (req, res) => {
    try {
      const { name, url, type, branch, path_filter, enabled } = req.body;

      if (!name || !url) {
        return handleValidationError('Name and URL are required', res, this.logger);
      }

      this.rulesManager.addSource({
        name,
        url,
        type: type || 'github',
        branch: branch || 'main',
        path_filter,
        enabled: enabled !== false,
      });

      return res.json({
        success: true,
        message: `Source "${name}" added successfully`,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error adding rule source');
    }
  };

  /**
   * Remove a rule source
   */
  removeRuleSource = (req, res) => {
    try {
      const { name } = req.params;

      if (!name) {
        return handleValidationError('Source name is required', res, this.logger);
      }

      const result = this.rulesManager.removeSource(name);
      return res.json({
        success: true,
        message: `Source "${name}" removed`,
        rulesDeleted: result.rulesDeleted,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error removing rule source');
    }
  };

  /**
   * Sync rules from a specific source
   */
  syncRuleSource = async (req, res) => {
    try {
      const { name } = req.params;

      if (!name) {
        return handleValidationError('Source name is required', res, this.logger);
      }

      const result = await this.rulesManager.syncSource(name);
      return res.json(result);
    } catch (error) {
      handleError(error, res, this.logger, 'Error syncing rule source');
    }
  };

  /**
   * Sync all rule sources
   */
  syncAllRuleSources = async (_req, res) => {
    try {
      const result = await this.rulesManager.syncAllSources();
      return res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error syncing all rule sources');
    }
  };

  /**
   * Get community rules with filters
   */
  getCommunityRules = (req, res) => {
    try {
      const filters = {
        source: req.query.source,
        severity: req.query.severity,
        enabled:
          req.query.enabled === 'true' ? true : req.query.enabled === 'false' ? false : undefined,
        owasp_id: req.query.owasp_id,
        search: req.query.search,
        limit: req.query.limit ? Number.parseInt(req.query.limit, 10) : 100,
      };

      const rules = this.rulesManager.getRules(filters);
      const summary = this.rulesManager.getSummary();

      return res.json({
        success: true,
        rules,
        count: rules.length,
        summary,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error getting community rules');
    }
  };

  /**
   * Enable or disable a community rule
   */
  setRuleEnabled = (req, res) => {
    try {
      const { ruleId } = req.params;
      const { enabled } = req.body;

      if (!ruleId) {
        return handleValidationError('Rule ID is required', res, this.logger);
      }

      if (enabled === undefined) {
        return handleValidationError('Enabled status is required', res, this.logger);
      }

      this.rulesManager.setRuleEnabled(ruleId, enabled);
      return res.json({
        success: true,
        message: `Rule ${ruleId} ${enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error setting rule enabled');
    }
  };

  /**
   * Delete a community rule
   */
  deleteCommunityRule = (req, res) => {
    try {
      const { ruleId } = req.params;

      if (!ruleId) {
        return handleValidationError('Rule ID is required', res, this.logger);
      }

      this.rulesManager.deleteRule(ruleId);
      return res.json({
        success: true,
        message: `Rule ${ruleId} deleted`,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error deleting community rule');
    }
  };

  /**
   * Add a custom rule
   */
  addCustomRule = (req, res) => {
    try {
      const { content, name, description, severity } = req.body;

      if (!content) {
        return handleValidationError('Rule content is required', res, this.logger);
      }

      const result = this.rulesManager.addCustomRule({
        content,
        name,
        description,
        severity,
      });

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      return res.json(result);
    } catch (error) {
      handleError(error, res, this.logger, 'Error adding custom rule');
    }
  };

  /**
   * Load community rules into YARA engine
   */
  loadRulesIntoEngine = async (_req, res) => {
    try {
      const result = await this.rulesManager.loadRulesIntoEngine();
      return res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error loading rules into engine');
    }
  };

  /**
   * Initialize default rule sources
   */
  initializeSources = (_req, res) => {
    try {
      const count = this.rulesManager.initializeSources();
      return res.json({
        success: true,
        message: `Initialized ${count} default source(s)`,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error initializing sources');
    }
  };
}
