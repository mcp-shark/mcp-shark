/**
 * Static security rules index
 * Exports all OWASP MCP Top 10 + Agentic Security + General security rules
 */

// MCP OWASP Top 10 Rules
import * as mcp01 from './scans/mcp01TokenMismanagement.js';
import * as mcp02 from './scans/mcp02ScopeCreep.js';
import * as mcp03 from './scans/mcp03ToolPoisoning.js';
import * as mcp04 from './scans/mcp04SupplyChain.js';
import * as mcp05 from './scans/mcp05CommandInjection.js';
import * as mcp06 from './scans/mcp06PromptInjection.js';
import * as mcp07 from './scans/mcp07InsufficientAuth.js';
import * as mcp08 from './scans/mcp08LackAudit.js';
import * as mcp09 from './scans/mcp09ShadowServers.js';
import * as mcp10 from './scans/mcp10ContextInjection.js';

// Agentic Security Initiative (ASI) Rules
import * as asi01 from './scans/agentic01GoalHijack.js';
import * as asi02 from './scans/agentic02ToolMisuse.js';
import * as asi03 from './scans/agentic03IdentityAbuse.js';
import * as asi04 from './scans/agentic04SupplyChain.js';
import * as asi05 from './scans/agentic05RCE.js';
import * as asi06 from './scans/agentic06MemoryPoisoning.js';
import * as asi07 from './scans/agentic07InsecureCommunication.js';
import * as asi08 from './scans/agentic08CascadingFailures.js';
import * as asi09 from './scans/agentic09TrustExploitation.js';
import * as asi10 from './scans/agentic10RogueAgent.js';

// General Security Rules
import * as cmdInj from './scans/commandInjection.js';
import * as crossServer from './scans/crossServerShadowing.js';
import * as secrets from './scans/hardcodedSecrets.js';
import * as nameAmbig from './scans/toolNameAmbiguity.js';

/**
 * All available static rules with their analysis functions
 */
export const staticRules = {
  // MCP OWASP Top 10
  'mcp01-token-mismanagement': mcp01,
  'mcp02-scope-creep': mcp02,
  'mcp03-tool-poisoning': mcp03,
  'mcp04-supply-chain': mcp04,
  'mcp05-command-injection': mcp05,
  'mcp06-prompt-injection': mcp06,
  'mcp07-insufficient-auth': mcp07,
  'mcp08-lack-audit': mcp08,
  'mcp09-shadow-servers': mcp09,
  'mcp10-context-injection': mcp10,

  // Agentic Security Initiative
  'asi01-goal-hijack': asi01,
  'asi02-tool-misuse': asi02,
  'asi03-identity-abuse': asi03,
  'asi04-supply-chain': asi04,
  'asi05-rce': asi05,
  'asi06-memory-poisoning': asi06,
  'asi07-insecure-communication': asi07,
  'asi08-cascading-failures': asi08,
  'asi09-trust-exploitation': asi09,
  'asi10-rogue-agent': asi10,

  // General Security
  'command-injection': cmdInj,
  'cross-server-shadowing': crossServer,
  'hardcoded-secrets': secrets,
  'tool-name-ambiguity': nameAmbig,
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
