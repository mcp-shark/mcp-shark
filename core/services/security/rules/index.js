/**
 * Static security rules index — AUTO-GENERATED
 * Do not edit manually. Run: npm run generate:rules
 *
 * Exports all OWASP MCP Top 10 + Agentic Security + General security rules
 */

import * as agentic05RCE from './scans/agentic05RCE.js';
import * as commandInjection from './scans/commandInjection.js';
import * as configPermissions from './scans/configPermissions.js';
import * as crossServerShadowing from './scans/crossServerShadowing.js';
import * as duplicateToolNames from './scans/duplicateToolNames.js';
import * as insecureTransport from './scans/insecureTransport.js';
import * as mcp05CommandInjection from './scans/mcp05CommandInjection.js';
import * as missingContainment from './scans/missingContainment.js';
import * as shellEnvInjection from './scans/shellEnvInjection.js';
import * as toolNameAmbiguity from './scans/toolNameAmbiguity.js';
import * as unsafeDefaults from './scans/unsafeDefaults.js';

/**
 * All available static rules with their analysis functions
 */
export const staticRules = {
  [agentic05RCE.ruleMetadata.id]: agentic05RCE,
  [commandInjection.ruleMetadata.id]: commandInjection,
  [configPermissions.ruleMetadata.id]: configPermissions,
  [crossServerShadowing.ruleMetadata.id]: crossServerShadowing,
  [duplicateToolNames.ruleMetadata.id]: duplicateToolNames,
  [insecureTransport.ruleMetadata.id]: insecureTransport,
  [mcp05CommandInjection.ruleMetadata.id]: mcp05CommandInjection,
  [missingContainment.ruleMetadata.id]: missingContainment,
  [shellEnvInjection.ruleMetadata.id]: shellEnvInjection,
  [toolNameAmbiguity.ruleMetadata.id]: toolNameAmbiguity,
  [unsafeDefaults.ruleMetadata.id]: unsafeDefaults,
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
