/**
 * Rules Manager Service
 * Downloads, parses, and manages community YARA rules from GitHub repositories
 */
import { syncGitHubSource, syncUrlSource } from './GitHubRulesSync.js';
import { convertToSecurityRule, parseYaraFile, validateYaraRule } from './YaraRuleParser.js';

export class RulesManagerService {
  constructor(securityRulesRepository, yaraEngineService, logger) {
    this.rulesRepository = securityRulesRepository;
    this.yaraEngine = yaraEngineService;
    this.logger = logger;
  }

  /**
   * Initialize default rule sources
   */
  initializeSources() {
    return this.rulesRepository.initializeDefaultSources();
  }

  /**
   * Get all configured rule sources
   */
  getSources() {
    return this.rulesRepository.getSources();
  }

  /**
   * Add a new rule source
   */
  addSource(source) {
    return this.rulesRepository.upsertSource(source);
  }

  /**
   * Remove a rule source and its rules
   */
  removeSource(sourceName) {
    return this.rulesRepository.deleteSource(sourceName);
  }

  /**
   * Sync rules from a specific source
   */
  async syncSource(sourceName) {
    const source = this.rulesRepository.getSourceByName(sourceName);
    if (!source) {
      throw new Error(`Source not found: ${sourceName}`);
    }

    this.logger?.info({ source: sourceName }, 'Starting rule sync');

    try {
      const rules = await this._syncSourceByType(source);

      if (rules.length > 0) {
        this.rulesRepository.upsertRules(rules);
      }

      this.rulesRepository.updateSourceSyncStatus(sourceName, 'success', rules.length);
      this.logger?.info({ source: sourceName, ruleCount: rules.length }, 'Rule sync completed');

      return { success: true, source: sourceName, rulesCount: rules.length };
    } catch (error) {
      this.rulesRepository.updateSourceSyncStatus(sourceName, `error: ${error.message}`);
      this.logger?.error({ source: sourceName, error: error.message }, 'Rule sync failed');

      return { success: false, source: sourceName, error: error.message };
    }
  }

  /**
   * Sync source based on type
   */
  async _syncSourceByType(source) {
    if (source.type === 'github') {
      return syncGitHubSource(source, this.logger);
    }
    if (source.type === 'url') {
      return syncUrlSource(source);
    }
    throw new Error(`Unsupported source type: ${source.type}`);
  }

  /**
   * Sync all enabled sources
   */
  async syncAllSources() {
    const sources = this.rulesRepository.getEnabledSources();
    const results = [];

    for (const source of sources) {
      const result = await this.syncSource(source.name);
      results.push(result);
    }

    return {
      totalSources: sources.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      totalRules: results.reduce((sum, r) => sum + (r.rulesCount || 0), 0),
      results,
    };
  }

  /**
   * Get all rules with optional filters
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
   * Enable or disable a rule
   */
  setRuleEnabled(ruleId, enabled) {
    return this.rulesRepository.setRuleEnabled(ruleId, enabled);
  }

  /**
   * Delete a specific rule
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
   * Load enabled community rules into YARA engine
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

    this.logger?.info({ loaded, failed }, 'Loaded community rules into engine');

    return { loaded, failed, results };
  }

  /**
   * Validate a YARA rule before adding
   */
  validateRule(content) {
    return validateYaraRule(content);
  }

  /**
   * Add a custom rule
   */
  addCustomRule(rule) {
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
      ...rule,
    };

    this.rulesRepository.upsertRule(dbRule);

    return { success: true, rule: dbRule };
  }
}
