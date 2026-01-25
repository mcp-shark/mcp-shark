import { convertToolFinding } from '../utils/adapter.js';
import { normalizeName, toolToText, unique } from '../utils/text.js';

const RULE_ID = 'cross-server-shadowing';
const OWASP_ID = 'SHADOW';
const RECOMMENDATION =
  'Avoid referencing other servers or tools in metadata; keep each component self-describing.';
const MIN_TERM_LENGTH = 3;

function buildNameMap(tools = []) {
  const map = new Map();
  for (const tool of tools) {
    if (tool?.name) {
      map.set(tool.name, {
        name: tool.name,
        server: tool.server_name || tool.server?.name || null,
      });
    }
  }
  return map;
}

function buildRegexForTerm(term) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i');
}

function scanTextForReferences(text, termMap, currentName, currentServer) {
  if (!text) {
    return { tools: [], servers: [] };
  }
  const referencedTools = new Set();
  const referencedServers = new Set();

  for (const { name, server } of termMap) {
    if (!name || name === currentName || name.length < MIN_TERM_LENGTH) {
      continue;
    }
    const regex = buildRegexForTerm(name);
    if (regex.test(text)) {
      if (server && server !== currentServer) {
        referencedTools.add(name);
        referencedServers.add(server);
      } else if (!server) {
        referencedTools.add(name);
      }
    }
  }

  return {
    tools: Array.from(referencedTools),
    servers: Array.from(referencedServers),
  };
}

export function scanCrossServerShadowing(mcpData = {}) {
  const results = {
    toolFindings: [],
    notablePatterns: [],
    recommendations: [RECOMMENDATION],
  };

  const tools = mcpData.tools || [];
  if (!tools.length) {
    return results;
  }

  const nameMap = buildNameMap(tools);
  const serverNames = unique(
    tools.map((tool) => tool.server_name || tool.server?.name).filter(Boolean)
  );

  const serverRegexes = serverNames
    .filter((name) => normalizeName(name).length >= MIN_TERM_LENGTH)
    .map((name) => ({
      name,
      regex: buildRegexForTerm(name),
    }));

  for (const tool of tools) {
    const text = toolToText(tool);
    if (!text) {
      continue;
    }

    const referenceSummary = scanTextForReferences(
      text,
      nameMap,
      tool?.name,
      tool?.server_name || tool?.server?.name
    );

    const serverMentions = serverRegexes
      .filter(({ name, regex }) => {
        if (name === (tool?.server_name || tool?.server?.name)) {
          return false;
        }
        return regex.test(text);
      })
      .map(({ name }) => name);

    const referencedTools = unique([...referenceSummary.tools]);
    const referencedServers = unique([...referenceSummary.servers, ...serverMentions]);

    if (!referencedTools.length && !referencedServers.length) {
      continue;
    }

    const severity = referencedTools.length ? 'high' : 'medium';

    results.toolFindings.push({
      issueType: 'Cross-Server Tool Shadowing',
      name: tool?.name || 'unnamed-tool',
      severity,
      reasons: [
        referencedTools.length
          ? `References other tools: ${referencedTools.join(', ')}.`
          : `Mentions other servers: ${referencedServers.join(', ')}.`,
      ],
      tags: ['cross-server'],
      safeUseNotes:
        'Ensure the tool description only reflects local behavior to avoid shadowing other components.',
    });
  }

  return results;
}

export function analyzeTool(tool, _serverName, allTools = []) {
  const result = scanCrossServerShadowing({ tools: allTools.length ? allTools : [tool] });
  const toolFinding = result.toolFindings.find((f) => f.name === tool.name);
  if (!toolFinding) {
    return [];
  }
  return [convertToolFinding(toolFinding, RULE_ID, OWASP_ID, RECOMMENDATION)];
}

export function analyzePrompt() {
  return [];
}

export function analyzeResource() {
  return [];
}

export function analyzePacket() {
  return [];
}

export const ruleMetadata = {
  id: RULE_ID,
  name: 'Cross-Server Tool Shadowing Detection',
  owasp_id: OWASP_ID,
  severity: 'high',
  description: 'Detects tools that reference other servers or tools in their metadata.',
  source: 'static',
  type: 'general-security',
};
