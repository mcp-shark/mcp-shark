import { convertToSecurityRule, parseYaraFile, validateYaraRule } from './YaraRuleParser.js';
/**
 * Rules Manager Service (Simplified)
 * Manages user-defined YARA rules for extensibility
 */
import { getPredefinedRules } from './predefinedYaraRules.js';

export class RulesManagerService {
  constructor(securityRulesRepository, yaraEngineService, logger) {
    this.rulesRepository = securityRulesRepository;
    this.yaraEngine = yaraEngineService;
    this.logger = logger;
  }

  // === Source Management (simplified - no remote syncing) ===

  getSources() {
    return this.rulesRepository.getSources();
  }

  addSource(source) {
    return this.rulesRepository.upsertSource(source);
  }

  removeSource(sourceName) {
    return this.rulesRepository.deleteSource(sourceName);
  }

  initializeSources() {
    this.seedPredefinedRules();
    return this.rulesRepository.initializeDefaultSources();
  }

  /**
   * Seed predefined YARA rules to database (if not already present)
   */
  seedPredefinedRules() {
    const predefinedRules = getPredefinedRules();
    const seededRules = predefinedRules.filter((rule) => {
      const existing = this.rulesRepository.getRuleById(rule.rule_id);
      if (!existing) {
        this.rulesRepository.upsertRule(rule);
        return true;
      }
      return false;
    });
    const seeded = seededRules.length;

    if (seeded > 0) {
      this.logger?.info({ seeded, total: predefinedRules.length }, 'Seeded predefined YARA rules');
    }

    return { seeded, total: predefinedRules.length };
  }

  /**
   * Reset predefined rules to defaults (delete and re-seed)
   */
  resetPredefinedRules() {
    const predefinedRules = getPredefinedRules();
    const ruleIds = predefinedRules.map((r) => r.rule_id);

    // Delete existing predefined rules
    const deletedRules = ruleIds.filter((ruleId) => {
      const result = this.rulesRepository.deleteRule(ruleId);
      return result.changes > 0;
    });
    const deleted = deletedRules.length;

    // Re-seed all predefined rules
    predefinedRules.forEach((rule) => {
      this.rulesRepository.upsertRule(rule);
    });

    this.logger?.info({ deleted, reseeded: predefinedRules.length }, 'Reset predefined YARA rules');

    return { deleted, reseeded: predefinedRules.length };
  }

  async syncSource(_sourceName) {
    // Simplified: no remote syncing, just return success
    return { success: true, source: _sourceName, rulesCount: 0, message: 'Local rules only' };
  }

  async syncAllSources() {
    // Simplified: no remote syncing
    return { totalSources: 0, successful: 0, failed: 0, totalRules: 0, results: [] };
  }

  // === Rule Management ===

  getRules(filters = {}) {
    return this.rulesRepository.getRules(filters);
  }

  getEnabledRules() {
    return this.rulesRepository.getEnabledRules();
  }

  getRule(ruleId) {
    return this.rulesRepository.getRuleById(ruleId);
  }

  setRuleEnabled(ruleId, enabled) {
    return this.rulesRepository.setRuleEnabled(ruleId, enabled);
  }

  deleteRule(ruleId) {
    return this.rulesRepository.deleteRule(ruleId);
  }

  getSummary() {
    return this.rulesRepository.getSummary();
  }

  validateRule(content) {
    return validateYaraRule(content);
  }

  addCustomRule(rule) {
    return this.saveRule(rule);
  }

  saveRule(rule) {
    const validation = this.validateRule(rule.content);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const parsed = parseYaraFile(rule.content);
    if (!parsed.length) {
      return { success: false, errors: ['No valid rules found in content'] };
    }

    const parsedRule = convertToSecurityRule(parsed[0], 'custom');
    const dbRule = {
      ...parsedRule,
      content: rule.content,
      source: 'custom',
      enabled: rule.enabled !== false,
      // Only override with caller values if explicitly provided
      ...(rule.name && { name: rule.name }),
      ...(rule.description && { description: rule.description }),
      ...(rule.severity && { severity: rule.severity }),
      ...(rule.rule_id && { rule_id: rule.rule_id }),
    };

    this.rulesRepository.upsertRule(dbRule);
    this.logger?.info({ ruleId: dbRule.rule_id }, 'Custom rule saved');

    return { success: true, rule: dbRule };
  }

  parseRule(content) {
    const validation = this.validateRule(content);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const parsed = parseYaraFile(content);
    if (!parsed.length) {
      return { success: false, errors: ['No valid rules found'] };
    }

    return { success: true, rules: parsed, warnings: validation.warnings };
  }

  async loadRulesIntoEngine() {
    // Load all enabled rules from database (predefined + custom are both in DB)
    const enabledRules = this.getEnabledRules();

    if (!enabledRules.length) {
      return { loaded: 0, failed: 0 };
    }

    const results = await this.yaraEngine.loadRules(
      enabledRules.map((r) => ({ id: r.rule_id, content: r.content }))
    );

    const loaded = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    this.logger?.info(
      { loaded, failed, total: enabledRules.length },
      'Loaded YARA rules into engine'
    );

    return { loaded, failed, results };
  }

  getTemplateRule() {
    return {
      content: `rule sample_mcp_rule : security
{
    meta:
        description = "Sample MCP security rule"
        author = "Your Name"
        severity = "medium"
        owasp_id = "MCP01"
    
    strings:
        $suspicious = "suspicious_pattern" nocase
        $secret = /sk-[a-zA-Z0-9]{40,}/
    
    condition:
        any of them
}`,
      name: 'sample_mcp_rule',
    };
  }
}
