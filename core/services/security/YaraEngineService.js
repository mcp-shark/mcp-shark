/**
 * YARA Engine Service
 * Provides optional native YARA scanning with fallback to static rules
 * Note: Native YARA requires @automattic/yara to be installed separately
 */
import { convertMatchesToFindings, formatMatch } from './YaraMatchConverter.js';

// Module-level state for YARA availability (const objects with mutable properties)
const yaraState = {
  module: null,
  available: false,
  loadError: null,
  initAttempted: false,
};

export class YaraEngineService {
  constructor(staticRulesService, logger) {
    this.staticRulesService = staticRulesService;
    this.logger = logger;
    this.scanner = null;
    this.loadedRules = new Map();
    this.initialized = false;
  }

  /**
   * Check if native YARA is available
   */
  isNativeAvailable() {
    return yaraState.available;
  }

  /**
   * Get the reason why native YARA is unavailable
   */
  getNativeError() {
    return yaraState.loadError;
  }

  /**
   * Attempt to load native YARA module
   */
  async _tryLoadNativeYara() {
    if (yaraState.initAttempted) {
      return yaraState.available;
    }

    yaraState.initAttempted = true;

    try {
      const module = await import('@automattic/yara').catch(() => null);
      if (module) {
        yaraState.module = module;
        yaraState.available = true;
        return true;
      }
    } catch (error) {
      yaraState.loadError = error.message;
    }

    return false;
  }

  /**
   * Initialize the YARA engine (if native is available)
   */
  async initialize() {
    if (this.initialized) {
      return { success: true, native: yaraState.available };
    }

    await this._tryLoadNativeYara();

    if (!yaraState.available) {
      this.logger?.info('Native YARA not available, using static rules fallback');
      this.initialized = true;
      return { success: true, native: false, fallback: true };
    }

    try {
      await yaraState.module.initialize();
      this.scanner = yaraState.module.createScanner();
      this.initialized = true;
      this.logger?.info('Native YARA engine initialized successfully');
      return { success: true, native: true };
    } catch (error) {
      this.logger?.warn({ error: error.message }, 'Failed to initialize native YARA');
      yaraState.available = false;
      yaraState.loadError = error.message;
      this.initialized = true;
      return { success: true, native: false, fallback: true, error: error.message };
    }
  }

  /**
   * Load a YARA rule from string content
   */
  async loadRule(ruleId, ruleContent) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!yaraState.available) {
      this.loadedRules.set(ruleId, { content: ruleContent, compiled: false });
      return { success: true, native: false };
    }

    try {
      await this.scanner.addRulesFromString(ruleContent);
      this.loadedRules.set(ruleId, { content: ruleContent, compiled: true });
      return { success: true, native: true };
    } catch (error) {
      this.logger?.error({ ruleId, error: error.message }, 'Failed to load YARA rule');
      this.loadedRules.set(ruleId, { content: ruleContent, compiled: false, error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Load multiple YARA rules
   */
  async loadRules(rules) {
    const results = [];
    for (const rule of rules) {
      const result = await this.loadRule(rule.id, rule.content);
      results.push({ ...result, ruleId: rule.id });
    }
    return results;
  }

  /**
   * Scan content with YARA rules (native) or static rules (fallback)
   */
  async scan(content, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    const { serverName = null, sessionId = null, targetType = 'packet' } = options;

    if (yaraState.available && this.scanner && this.loadedRules.size > 0) {
      try {
        const buffer = Buffer.isBuffer(content) ? content : Buffer.from(String(content));
        const matches = await this.scanner.scan(buffer);

        return {
          native: true,
          matches: matches.map(formatMatch),
          findings: convertMatchesToFindings(matches, { serverName, sessionId, targetType }),
        };
      } catch (error) {
        this.logger?.error({ error: error.message }, 'YARA scan failed');
      }
    }

    // Fallback to static rules
    const contentStr = Buffer.isBuffer(content) ? content.toString('utf8') : String(content);
    const packet = { frameNumber: options.frameNumber || 0, body: contentStr };
    const findings = this.staticRulesService.analyzePacket(packet, sessionId);

    return {
      native: false,
      matches: [],
      findings: findings.map((f) => ({ ...f, server_name: serverName || f.server_name })),
    };
  }

  /**
   * Scan a tool definition
   */
  async scanTool(tool, serverName = null) {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.staticRulesService.analyzeTool(tool, serverName);
  }

  /**
   * Scan a prompt definition
   */
  async scanPrompt(prompt, serverName = null) {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.staticRulesService.analyzePrompt(prompt, serverName);
  }

  /**
   * Scan a resource definition
   */
  async scanResource(resource, serverName = null) {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.staticRulesService.analyzeResource(resource, serverName);
  }

  /**
   * Get engine status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      nativeAvailable: yaraState.available,
      nativeError: yaraState.loadError,
      loadedRulesCount: this.loadedRules.size,
      compiledRulesCount: Array.from(this.loadedRules.values()).filter((r) => r.compiled).length,
    };
  }

  /**
   * Clear all loaded rules
   */
  async clearRules() {
    this.loadedRules.clear();
    if (yaraState.available && this.scanner) {
      this.scanner = yaraState.module.createScanner();
    }
  }
}
