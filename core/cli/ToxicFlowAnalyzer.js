/**
 * Toxic Flow Analyzer
 * Detects dangerous cross-server composition risks by classifying
 * tools by capability and identifying pairs that create attack paths
 * through the shared LLM context window.
 *
 * Catalog references: §1.1, §1.2, §1.3, §1.7, §1.10, §1.12, §1.13, §1.14
 */
import { TOOL_CLASSIFICATIONS } from './ToolClassifications.js';

/**
 * Dangerous flow rules: source_capability → target_capability
 * Each produces a specific attack scenario
 */
const TOXIC_FLOW_RULES = [
  {
    source: 'ingests_untrusted',
    target: 'writes_code',
    risk: 'HIGH',
    title: 'Prompt injection → code modification',
    scenario: (src, tgt) =>
      `A ${src.ide} message with prompt injection processed by ${src.name} ` +
      `could cause your agent to push malicious code via ${tgt.name}.`,
    catalog: '§1.3, §1.10, §1.12',
    owasp: 'MCP03 + MCP10',
  },
  {
    source: 'ingests_untrusted',
    target: 'sends_external',
    risk: 'HIGH',
    title: 'Prompt injection → data exfiltration',
    scenario: (src, tgt) =>
      `Untrusted content ingested by ${src.name} could instruct the agent ` +
      `to exfiltrate sensitive data through ${tgt.name}.`,
    catalog: '§1.2',
    owasp: 'MCP03 + MCP06',
  },
  {
    source: 'reads_secrets',
    target: 'sends_external',
    risk: 'HIGH',
    title: 'Secret theft via external channel',
    scenario: (src, tgt) =>
      `Your agent can read sensitive files via ${src.name} ` +
      `and exfiltrate them through ${tgt.name}.`,
    catalog: '§1.1, §1.14',
    owasp: 'MCP01 + MCP10',
  },
  {
    source: 'ingests_untrusted',
    target: 'modifies_infra',
    risk: 'HIGH',
    title: 'Prompt injection → infrastructure takeover',
    scenario: (src, tgt) =>
      `Attacker-controlled content from ${src.name} could cause ` +
      `infrastructure changes via ${tgt.name}.`,
    catalog: '§1.13',
    owasp: 'MCP03 + MCP05',
  },
  {
    source: 'reads_secrets',
    target: 'ingests_untrusted',
    risk: 'MEDIUM',
    title: 'Sensitive data leakage to untrusted channel',
    scenario: (src, tgt) =>
      `Sensitive data from ${src.name} could leak into context shared with ` +
      `untrusted content from ${tgt.name}.`,
    catalog: '§1.7',
    owasp: 'MCP10',
  },
];

/**
 * Classify a tool's capability based on known classifications and heuristics
 */
function classifyTool(serverName, toolName) {
  const serverClassifications = TOOL_CLASSIFICATIONS[serverName];
  if (serverClassifications?.[toolName]) {
    return serverClassifications[toolName];
  }

  const nameLower = (toolName || '').toLowerCase();

  if (
    matchesPatterns(nameLower, ['send_message', 'post_message', 'send_email', 'send_notification'])
  ) {
    return 'sends_external';
  }
  if (
    matchesPatterns(nameLower, [
      'write_file',
      'create_file',
      'push',
      'commit',
      'create_pr',
      'create_pull',
    ])
  ) {
    return 'writes_code';
  }
  if (
    matchesPatterns(nameLower, ['read_file', 'get_file', 'list_dir', 'get_config', 'get_secret'])
  ) {
    return 'reads_secrets';
  }
  if (
    matchesPatterns(nameLower, [
      'get_issue',
      'get_ticket',
      'list_messages',
      'search',
      'fetch',
      'scrape',
    ])
  ) {
    return 'ingests_untrusted';
  }
  if (matchesPatterns(nameLower, ['deploy', 'kubectl', 'docker', 'transfer', 'scale', 'restart'])) {
    return 'modifies_infra';
  }

  return null;
}

/**
 * Check if a name matches any of the patterns
 */
function matchesPatterns(name, patterns) {
  for (const pattern of patterns) {
    if (name.includes(pattern)) {
      return true;
    }
  }
  return false;
}

/**
 * Classify all tools in a server and return capabilities
 */
function classifyServer(server) {
  const capabilities = new Set();
  const classifiedTools = {};

  const toolNames = extractToolNames(server);

  for (const toolName of toolNames) {
    const capability = classifyTool(server.name, toolName);
    if (capability) {
      capabilities.add(capability);
      classifiedTools[toolName] = capability;
    }
  }

  return { capabilities: [...capabilities], classifiedTools };
}

/**
 * Extract tool names from a server definition
 */
function extractToolNames(server) {
  if (Array.isArray(server.tools)) {
    return server.tools.map((t) => t.name || t);
  }
  if (server.tools && typeof server.tools === 'object') {
    return Object.keys(server.tools);
  }
  return [];
}

/**
 * Analyze toxic flows across all servers
 * @param {Array} servers - Flat list of server objects with { name, ide, config, tools }
 * @returns {Array} Array of toxic flow results
 */
export function analyzeToxicFlows(servers) {
  const classifiedServers = servers.map((server) => ({
    ...server,
    ...classifyServer(server),
  }));

  const flows = [];

  for (const rule of TOXIC_FLOW_RULES) {
    const sources = classifiedServers.filter((s) => s.capabilities.includes(rule.source));
    const targets = classifiedServers.filter((s) => s.capabilities.includes(rule.target));

    for (const src of sources) {
      for (const tgt of targets) {
        if (src.name === tgt.name) {
          continue;
        }

        flows.push({
          source: src.name,
          sourceIde: src.ide,
          target: tgt.name,
          targetIde: tgt.ide,
          risk: rule.risk,
          title: rule.title,
          scenario: rule.scenario(src, tgt),
          catalog: rule.catalog,
          owasp: rule.owasp,
          sourceCapability: rule.source,
          targetCapability: rule.target,
        });
      }
    }
  }

  return deduplicateFlows(flows);
}

/**
 * Remove duplicate flows (same source→target pair, keep highest risk)
 */
function deduplicateFlows(flows) {
  const seen = new Map();
  for (const flow of flows) {
    const key = `${flow.source}→${flow.target}`;
    const existing = seen.get(key);
    if (!existing || riskLevel(flow.risk) > riskLevel(existing.risk)) {
      seen.set(key, flow);
    }
  }
  return [...seen.values()];
}

/**
 * Convert risk string to numeric level for comparison
 */
function riskLevel(risk) {
  const levels = { HIGH: 3, MEDIUM: 2, LOW: 1 };
  return levels[risk] || 0;
}
