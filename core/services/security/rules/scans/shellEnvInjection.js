/**
 * Shell/Environment Injection Detection
 * Detects MCP server configs using shell: true or unsanitized
 * environment variable interpolation in commands, which can
 * enable command injection via environment variables.
 * Catalog reference: §1.9 (env-based command injection)
 */
import { createRuleAdapter } from '../utils/adapter.js';

const RULE_ID = 'shell-env-injection';
const OWASP_ID = 'MCP05';
const RECOMMENDATION =
  'Avoid shell: true in server spawn configs. Use direct command arrays instead of shell string interpolation.';

export function scanShellEnvInjection(_mcpData = {}) {
  return {
    toolFindings: [],
    resourceFindings: [],
    promptFindings: [],
    notablePatterns: [],
    recommendations: [RECOMMENDATION],
  };
}

/**
 * Analyze a server config for shell injection risks
 * Called directly by ScanService
 * @param {string} serverName
 * @param {object} config - Server config with command, args, env
 * @returns {Array} Findings
 */
export function analyzeServerShellRisk(serverName, config) {
  const findings = [];

  if (!config) {
    return findings;
  }

  const command = config.command || '';
  const args = config.args || [];
  const argsStr = Array.isArray(args) ? args.join(' ') : String(args);
  const fullCommand = `${command} ${argsStr}`;

  if (hasShellInterpolation(fullCommand)) {
    findings.push({
      rule_id: RULE_ID,
      severity: 'high',
      owasp_id: OWASP_ID,
      title: `Shell interpolation in ${serverName} command`,
      description: `Server "${serverName}" command contains shell variable interpolation that could be exploited if env vars are attacker-controlled.`,
      recommendation: RECOMMENDATION,
      server_name: serverName,
      confidence: 'probable',
    });
  }

  if (hasPipeOrChain(fullCommand)) {
    findings.push({
      rule_id: RULE_ID,
      severity: 'critical',
      owasp_id: OWASP_ID,
      title: `Shell pipe/chain in ${serverName} command`,
      description: `Server "${serverName}" command uses shell pipes or chains (|, &&, ;) which are dangerous with shell: true.`,
      recommendation: 'Remove shell operators from server command. Use direct process spawning.',
      server_name: serverName,
      confidence: 'definite',
    });
  }

  return findings;
}

/**
 * Check for shell variable interpolation patterns
 */
function hasShellInterpolation(text) {
  return /\$\([^)]+\)/.test(text) || /`[^`]+`/.test(text);
}

/**
 * Check for shell pipe or chain operators
 */
function hasPipeOrChain(text) {
  return /[|&;]/.test(text) && !/https?:\/\//.test(text);
}

const adapter = createRuleAdapter(scanShellEnvInjection, RULE_ID, OWASP_ID, RECOMMENDATION);
export const analyzeTool = adapter.analyzeTool;
export const analyzePrompt = adapter.analyzePrompt;
export const analyzeResource = adapter.analyzeResource;
export const analyzePacket = adapter.analyzePacket;

export const ruleMetadata = {
  id: RULE_ID,
  name: 'Shell/Environment Injection',
  owasp_id: OWASP_ID,
  severity: 'high',
  description: 'Detects shell interpolation and pipe operators in server commands.',
  source: 'static',
  type: 'general-security',
};
