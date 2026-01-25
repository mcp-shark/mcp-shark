/**
 * Rules Manager Service (Simplified)
 * Manages user-defined YARA rules for extensibility
 */
import { convertToSecurityRule, parseYaraFile, validateYaraRule } from './YaraRuleParser.js';

export class RulesManagerService {
  constructor(securityRulesRepository, yaraEngineService, logger) {
    this.rulesRepository = securityRulesRepository;
    this.yaraEngine = yaraEngineService;
    this.logger = logger;
  }

  /**
   * Get all user-defined rules
   */
  getRules(filters = {}) {
    return this.rulesRepository.getRules(filters);
  }

  /**
   * Get enabled rules
   */
  getEnabledRules() {
    return this.rulesRepository.getEnabledRules();
  }

  /**
   * Get a single rule by ID
   */
  getRule(ruleId) {
    return this.rulesRepository.getRuleById(ruleId);
  }

  /**
   * Enable or disable a rule
   */
  setRuleEnabled(ruleId, enabled) {
    return this.rulesRepository.setRuleEnabled(ruleId, enabled);
  }

  /**
   * Delete a rule
   */
  deleteRule(ruleId) {
    return this.rulesRepository.deleteRule(ruleId);
  }

  /**
   * Get summary of all rules
   */
  getSummary() {
    return this.rulesRepository.getSummary();
  }

  /**
   * Validate a YARA rule before adding
   */
  validateRule(content) {
    return validateYaraRule(content);
  }

  /**
   * Add or update a custom YARA rule
   */
  saveRule(rule) {
    const validation = this.validateRule(rule.content);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const parsed = parseYaraFile(rule.content);
    if (!parsed.length) {
      return { success: false, errors: ['No valid rules found in content'] };
    }

    const dbRule = {
      ...convertToSecurityRule(parsed[0], 'custom'),
      content: rule.content,
      source: 'custom',
      enabled: rule.enabled !== false,
      ...rule,
    };

    this.rulesRepository.upsertRule(dbRule);
    this.logger?.info({ ruleId: dbRule.rule_id }, 'Custom rule saved');

    return { success: true, rule: dbRule };
  }

  /**
   * Parse YARA content without saving (for preview)
   */
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

  /**
   * Load enabled rules into YARA engine
   */
  async loadRulesIntoEngine() {
    const rules = this.getEnabledRules();

    if (!rules.length) {
      return { loaded: 0, failed: 0 };
    }

    const results = await this.yaraEngine.loadRules(
      rules.map((r) => ({ id: r.rule_id, content: r.content }))
    );

    const loaded = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    this.logger?.info({ loaded, failed }, 'Loaded custom rules into engine');

    return { loaded, failed, results };
  }

  /**
   * Get sample YARA rule template
   */
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
