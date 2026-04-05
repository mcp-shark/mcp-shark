/**
 * Toxic Flow Analyzer
 * Detects dangerous cross-server composition risks by classifying
 * tools by capability and identifying pairs that create attack paths
 * through the shared LLM context window.
 *
 * Flow rules are loaded from data/toxic-flow-rules.json (built-in),
 * optional toxic_flow_rules inside rule-pack JSON under data/rule-packs/ and
 * .mcp-shark/rule-packs/, and user overrides from .mcp-shark/flows.yaml.
 *
 * Catalog references: §1.1, §1.2, §1.3, §1.7, §1.10, §1.12, §1.13, §1.14
 */
import { join } from 'node:path';
import { loadBuiltinJson, loadToxicFlowRulesFromPacksDir, loadUserYamlList } from './DataLoader.js';
import { TOOL_CLASSIFICATIONS } from './ToolClassifications.js';

const BUILTIN_PACKS_DIR = join(import.meta.dirname, 'data', 'rule-packs');
const USER_PACKS_DIR = join(process.cwd(), '.mcp-shark', 'rule-packs');

const BUILTIN_FLOWS = loadBuiltinJson('toxic-flow-rules.json');
const PACK_FLOWS_BUILTIN = loadToxicFlowRulesFromPacksDir(BUILTIN_PACKS_DIR);
const PACK_FLOWS_USER = loadToxicFlowRulesFromPacksDir(USER_PACKS_DIR);
const USER_FLOWS = loadUserYamlList('flows.yaml');
const TOXIC_FLOW_RULES = [
  ...BUILTIN_FLOWS,
  ...PACK_FLOWS_BUILTIN,
  ...PACK_FLOWS_USER,
  ...USER_FLOWS,
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
 * Interpolate a scenario template string with source/target context.
 * Replaces {source}, {target}, {source_ide}, {target_ide} placeholders.
 */
function interpolateScenario(template, src, tgt) {
  return template
    .replace(/\{source_ide\}/g, src.ide || 'IDE')
    .replace(/\{target_ide\}/g, tgt.ide || 'IDE')
    .replace(/\{source\}/g, src.name)
    .replace(/\{target\}/g, tgt.name);
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
          scenario: interpolateScenario(rule.scenario, src, tgt),
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
 * Remove duplicate flows (same source, target, IDE pair, capability pair, and title; keep highest risk)
 */
function deduplicateFlows(flows) {
  const seen = new Map();
  for (const flow of flows) {
    const key = [
      flow.source,
      flow.sourceIde,
      flow.target,
      flow.targetIde,
      flow.sourceCapability,
      flow.targetCapability,
      flow.title,
    ].join('\u2192');
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
