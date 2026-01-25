import { SECRET_PATTERNS } from '../constants.js';
import { convertPacketFinding, createRuleAdapter } from '../utils/adapter.js';
import { packetToText, promptToText, resourceToText, toolToText } from '../utils/text.js';

const RULE_ID = 'mcp01-token-mismanagement';
const OWASP_ID = 'MCP01';
const RECOMMENDATION =
  'Move all tokens and secrets to secure storage (environment variables, secret managers). Never embed credentials in MCP server configurations.';

function scanText(text) {
  if (!text) {
    return null;
  }
  const matches = [];
  for (const pattern of SECRET_PATTERNS) {
    pattern.regex.lastIndex = 0;
    const match = text.match(pattern.regex);
    if (match) {
      matches.push({ type: pattern.type, sample: match[0] });
    }
  }
  return matches.length > 0 ? matches : null;
}

function buildReason(entity, matches) {
  const types = matches.map((m) => m.type).join(', ');
  return `Token or secret exposure detected in ${entity}: ${types}`;
}

export function scanMCP01TokenMismanagement(mcpData = {}) {
  const results = {
    toolFindings: [],
    resourceFindings: [],
    promptFindings: [],
    notablePatterns: [],
    recommendations: [RECOMMENDATION],
  };

  for (const tool of mcpData.tools || []) {
    const matches = scanText(toolToText(tool));
    if (matches) {
      results.toolFindings.push({
        issueType: 'Token Mismanagement',
        name: tool?.name || 'tool',
        severity: 'high',
        reasons: [buildReason(`tool "${tool?.name || 'unknown'}"`, matches)],
        tags: ['token-mismanagement', 'secret-exposure'],
        mcpCategory: OWASP_ID,
        safeUseNotes:
          'Remove all tokens and secrets from tool metadata. Use secure storage mechanisms.',
      });
    }
  }

  for (const resource of mcpData.resources || []) {
    const matches = scanText(resourceToText(resource));
    if (matches) {
      results.resourceFindings.push({
        issueType: 'Token Mismanagement',
        uri: resource?.uri || resource?.name || 'resource',
        severity: 'high',
        reasons: [
          buildReason(`resource "${resource?.name || resource?.uri || 'unknown'}"`, matches),
        ],
        tags: ['token-mismanagement', 'secret-exposure'],
        mcpCategory: OWASP_ID,
      });
    }
  }

  for (const prompt of mcpData.prompts || []) {
    const matches = scanText(promptToText(prompt));
    if (matches) {
      results.promptFindings.push({
        issueType: 'Token Mismanagement',
        name: prompt?.name || 'prompt',
        severity: 'medium',
        reasons: [buildReason(`prompt "${prompt?.name || 'unknown'}"`, matches)],
        tags: ['token-mismanagement', 'secret-exposure'],
        mcpCategory: OWASP_ID,
      });
    }
  }

  return results;
}

const adapter = createRuleAdapter(scanMCP01TokenMismanagement, RULE_ID, OWASP_ID, RECOMMENDATION);

export const analyzeTool = adapter.analyzeTool;
export const analyzePrompt = adapter.analyzePrompt;
export const analyzeResource = adapter.analyzeResource;

export function analyzePacket(packet) {
  const text = packetToText(packet);
  const matches = scanText(text);
  if (!matches) {
    return [];
  }
  const types = matches.map((m) => m.type).join(', ');
  return [
    convertPacketFinding(
      {
        issueType: 'Token Mismanagement',
        severity: 'high',
        title: 'Token/Secret Detected in Traffic',
        description: `Potential secret exposure in packet: ${types}`,
        evidence: matches[0]?.sample?.substring(0, 50) || '',
      },
      RULE_ID,
      OWASP_ID,
      RECOMMENDATION,
      packet
    ),
  ];
}

export const ruleMetadata = {
  id: RULE_ID,
  name: 'Token Mismanagement & Secret Exposure',
  owasp_id: OWASP_ID,
  severity: 'high',
  description:
    'Detects hard-coded credentials, API keys, and secrets that could be exposed through prompt injection or compromised context.',
  source: 'static',
  type: 'owasp-mcp',
};
