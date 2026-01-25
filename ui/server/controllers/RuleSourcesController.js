import { handleError, handleValidationError } from '../utils/errorHandler.js';

/**
 * Controller for Rule Sources and YARA Engine HTTP endpoints
 */
export class RuleSourcesController {
  constructor(rulesManagerService, yaraEngineService, logger) {
    this.rulesManager = rulesManagerService;
    this.yaraEngine = yaraEngineService;
    this.logger = logger;
  }

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
}
