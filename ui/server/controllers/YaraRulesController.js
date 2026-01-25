import { StatusCodes } from '#core/constants/index.js';
import { handleError, handleValidationError } from '../utils/errorHandler.js';

/**
 * Controller for YARA Rules CRUD HTTP endpoints
 */
export class YaraRulesController {
  constructor(rulesManagerService, logger) {
    this.rulesManager = rulesManagerService;
    this.logger = logger;
  }

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
   * Update an existing rule
   */
  updateRule = (req, res) => {
    try {
      const { ruleId } = req.params;
      const { content, name, description, severity, enabled } = req.body;

      if (!ruleId) {
        return handleValidationError('Rule ID is required', res, this.logger);
      }

      const existing = this.rulesManager.getRule(ruleId);
      if (!existing) {
        return res.status(StatusCodes.NOT_FOUND).json({ success: false, error: 'Rule not found' });
      }

      const result = this.rulesManager.saveRule({
        rule_id: ruleId,
        content: content || existing.content,
        name: name || existing.name,
        description: description || existing.description,
        severity: severity || existing.severity,
        enabled: enabled !== undefined ? enabled : existing.enabled,
      });

      return res.json(result);
    } catch (error) {
      handleError(error, res, this.logger, 'Error updating rule');
    }
  };

  /**
   * Reset predefined YARA rules to defaults
   */
  resetPredefinedRules = (_req, res) => {
    try {
      const result = this.rulesManager.resetPredefinedRules();
      return res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error resetting predefined rules');
    }
  };
}
