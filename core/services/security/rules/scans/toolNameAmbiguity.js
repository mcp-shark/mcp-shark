import { convertToolFinding } from '../utils/adapter.js';
import { hybridSimilarityScore } from '../utils/similarity.js';
import { unique } from '../utils/text.js';

const RULE_ID = 'tool-name-ambiguity';
const OWASP_ID = 'AMBIG';
const RECOMMENDATION =
  'Ensure tools have distinct names or prefixes to avoid accidental auto-selection.';
const MIN_NAME_LENGTH = 3;
const DEFAULT_THRESHOLD = 85;

function normalizeList(tools = []) {
  return tools
    .map((tool) => ({
      name: tool?.name || '',
      server: tool?.server_name || tool?.server?.name || null,
    }))
    .filter((item) => item.name && item.name.length >= MIN_NAME_LENGTH);
}

export function scanToolNameAmbiguity(mcpData = {}, threshold = DEFAULT_THRESHOLD) {
  const results = {
    toolFindings: [],
    notablePatterns: [],
    recommendations: [RECOMMENDATION],
  };

  const tools = normalizeList(mcpData.tools);
  if (tools.length < 2) {
    return results;
  }

  const issuesPerTool = new Map();

  for (let i = 0; i < tools.length; i++) {
    const a = tools[i];
    for (const b of tools.slice(i + 1)) {
      const score = hybridSimilarityScore(a.name, b.name);
      if (score >= threshold) {
        const severity = a.server && b.server && a.server !== b.server ? 'high' : 'medium';
        const reason = `Name overlaps with "${b.name}" (similarity ${score}%).`;
        const reasonB = `Name overlaps with "${a.name}" (similarity ${score}%).`;

        if (!issuesPerTool.has(a.name)) {
          issuesPerTool.set(a.name, []);
        }
        issuesPerTool.get(a.name).push({ severity, reason });

        if (!issuesPerTool.has(b.name)) {
          issuesPerTool.set(b.name, []);
        }
        issuesPerTool.get(b.name).push({ severity, reason: reasonB });
      }
    }
  }

  issuesPerTool.forEach((entries, name) => {
    const highestSeverity = entries.some((entry) => entry.severity === 'high') ? 'high' : 'medium';
    results.toolFindings.push({
      issueType: 'Tool Name Ambiguity',
      name,
      severity: highestSeverity,
      reasons: unique(entries.map((entry) => entry.reason)),
      tags: ['name-ambiguity'],
      safeUseNotes:
        'Consider renaming or adding prefixes to clearly distinguish similarly named tools.',
    });
  });

  return results;
}

export function analyzeTool(tool, _serverName, allTools = []) {
  const result = scanToolNameAmbiguity({ tools: allTools.length ? allTools : [tool] });
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
  name: 'Tool Name Ambiguity Detection',
  owasp_id: OWASP_ID,
  severity: 'medium',
  description: 'Detects tools with similar names that could cause confusion.',
  source: 'static',
  type: 'general-security',
};
