/**
 * Static security rules index
 * Exports all OWASP MCP Top 10 detection rules
 */
import * as mcp01 from './mcp01-token-exposure.js';
import * as mcp03 from './mcp03-tool-poisoning.js';
import * as mcp05 from './mcp05-command-injection.js';
import * as mcp06 from './mcp06-prompt-injection.js';
import * as mcp10 from './mcp10-context-oversharing.js';

/**
 * All available static rules with their analysis functions
 */
export const staticRules = {
  'mcp01-token-exposure': mcp01,
  'mcp03-tool-poisoning': mcp03,
  'mcp05-command-injection': mcp05,
  'mcp06-prompt-injection': mcp06,
  'mcp10-context-oversharing': mcp10,
};

/**
 * Get all rule metadata
 */
export function getAllRuleMetadata() {
  return Object.values(staticRules).map((rule) => rule.ruleMetadata);
}

/**
 * Get rule by ID
 */
export function getRule(ruleId) {
  return staticRules[ruleId] || null;
}

/**
 * Get all enabled rules (for now, all rules are enabled)
 */
export function getEnabledRules() {
  return Object.entries(staticRules).map(([id, rule]) => ({
    id,
    ...rule.ruleMetadata,
    analyzeTool: rule.analyzeTool,
    analyzePrompt: rule.analyzePrompt,
    analyzeResource: rule.analyzeResource,
    analyzePacket: rule.analyzePacket,
  }));
}
