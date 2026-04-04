/**
 * Duplicate Tool Names Detection (Config-Level)
 * Detects tools with identical names across different servers,
 * which enables cross-server shadowing attacks.
 * Catalog reference: §1.4 (tool name collision)
 */
import { createRuleAdapter } from '../utils/adapter.js';

const RULE_ID = 'duplicate-tool-names';
const OWASP_ID = 'MCP09';
const RECOMMENDATION =
  'Rename tools to be unique across all servers, or isolate conflicting servers into separate agent sessions.';

export function scanDuplicateToolNames(_mcpData = {}) {
  return {
    toolFindings: [],
    resourceFindings: [],
    promptFindings: [],
    notablePatterns: [],
    recommendations: [RECOMMENDATION],
  };
}

/**
 * Analyze all servers for duplicate tool names
 * Called directly by ScanService with the full server list
 * @param {Array} servers - Flat array of server objects
 * @returns {Array} Findings for duplicate tool names
 */
export function analyzeAllServerToolNames(servers) {
  const toolMap = new Map();

  for (const server of servers) {
    const tools = Array.isArray(server.tools) ? server.tools : [];
    for (const tool of tools) {
      const name = typeof tool === 'string' ? tool : tool?.name;
      if (!name) {
        continue;
      }
      if (!toolMap.has(name)) {
        toolMap.set(name, []);
      }
      toolMap.get(name).push(server.name);
    }
  }

  const findings = [];
  for (const [toolName, serverNames] of toolMap) {
    if (serverNames.length <= 1) {
      continue;
    }
    const uniqueServers = [...new Set(serverNames)];
    if (uniqueServers.length <= 1) {
      continue;
    }

    findings.push({
      rule_id: RULE_ID,
      severity: 'high',
      owasp_id: OWASP_ID,
      title: `Duplicate tool "${toolName}" across ${uniqueServers.length} servers`,
      description: `Tool "${toolName}" exists in ${uniqueServers.join(', ')}. An attacker could shadow one server's tool with another.`,
      recommendation: RECOMMENDATION,
      confidence: 'definite',
    });
  }

  return findings;
}

const adapter = createRuleAdapter(scanDuplicateToolNames, RULE_ID, OWASP_ID, RECOMMENDATION);
export const analyzeTool = adapter.analyzeTool;
export const analyzePrompt = adapter.analyzePrompt;
export const analyzeResource = adapter.analyzeResource;
export const analyzePacket = adapter.analyzePacket;

export const ruleMetadata = {
  id: RULE_ID,
  name: 'Duplicate Tool Names',
  owasp_id: OWASP_ID,
  severity: 'high',
  description: 'Detects identical tool names across servers enabling shadowing attacks.',
  source: 'static',
  type: 'general-security',
};
