/**
 * Config File Permissions Check
 * Detects world-readable MCP config files that may expose secrets.
 * Only applicable on Unix-like systems.
 */
import { createRuleAdapter } from '../utils/adapter.js';

const RULE_ID = 'config-permissions';
const OWASP_ID = 'MCP01';
const RECOMMENDATION =
  'Set config file permissions to 600 (owner read/write only). Run: npx mcp-shark scan --fix';

export function scanConfigPermissions(_mcpData = {}) {
  return {
    toolFindings: [],
    resourceFindings: [],
    promptFindings: [],
    notablePatterns: [],
    recommendations: [RECOMMENDATION],
  };
}

/**
 * Analyze a config file path for permission issues
 * Called directly by ScanService, not through the adapter
 * @param {string} configPath - Path to the config file
 * @param {string} permissions - Octal permission string (e.g., '644')
 * @returns {Array} Findings
 */
export function analyzeConfigPermissions(configPath, permissions) {
  if (process.platform === 'win32') {
    return [];
  }
  if (!permissions) {
    return [];
  }

  const perms = Number.parseInt(permissions, 8);
  const worldReadable = (perms & 0o004) !== 0;
  const groupReadable = (perms & 0o040) !== 0;

  const findings = [];

  if (worldReadable) {
    findings.push({
      rule_id: RULE_ID,
      severity: 'high',
      owasp_id: OWASP_ID,
      title: `Config file is world-readable (${permissions})`,
      description: `${configPath} has permissions ${permissions} — any user on this system can read your MCP secrets.`,
      recommendation: RECOMMENDATION,
      config_path: configPath,
      confidence: 'definite',
      fixable: true,
      fix_type: 'chmod',
      fix_data: { oldPerms: permissions },
    });
  } else if (groupReadable) {
    findings.push({
      rule_id: RULE_ID,
      severity: 'medium',
      owasp_id: OWASP_ID,
      title: `Config file is group-readable (${permissions})`,
      description: `${configPath} has permissions ${permissions} — group members can read your MCP secrets.`,
      recommendation: RECOMMENDATION,
      config_path: configPath,
      confidence: 'probable',
      fixable: true,
      fix_type: 'chmod',
      fix_data: { oldPerms: permissions },
    });
  }

  return findings;
}

const adapter = createRuleAdapter(scanConfigPermissions, RULE_ID, OWASP_ID, RECOMMENDATION);
export const analyzeTool = adapter.analyzeTool;
export const analyzePrompt = adapter.analyzePrompt;
export const analyzeResource = adapter.analyzeResource;
export const analyzePacket = adapter.analyzePacket;

export const ruleMetadata = {
  id: RULE_ID,
  name: 'Config File Permissions',
  owasp_id: OWASP_ID,
  severity: 'high',
  description: 'Detects world-readable or group-readable MCP configuration files.',
  source: 'static',
  type: 'general-security',
};
