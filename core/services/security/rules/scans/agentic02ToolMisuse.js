import { convertPacketFinding, createRuleAdapter } from '../utils/adapter.js';
import { packetToText, promptToText, resourceToText, toolToText } from '../utils/text.js';

const RULE_ID = 'asi02-tool-misuse';
const OWASP_ID = 'ASI02';
const RECOMMENDATION =
  'Implement tool usage monitoring and restrictions. Enforce scope boundaries for tool usage. Monitor for unauthorized tool combinations.';

const TOOL_MISUSE_PATTERNS = [
  /(?:misuse|abuse|exploit|manipulate)\s+(?:tool|function|capability|feature)/i,
  /(?:use|utilize|invoke)\s+(?:tool|function)\s+(?:outside|beyond|outside\s+of)\s+(?:intended|authorized|allowed)\s+(?:scope|purpose|context)/i,
  /(?:unauthorized|illegitimate|improper)\s+(?:tool|function)\s+(?:usage|use|invocation)/i,
  /(?:combine|chain|sequence)\s+(?:tools|functions)\s+(?:to|for)\s+(?:achieve|perform|execute)\s+(?:unauthorized|malicious)/i,
];

function scanText(text) {
  if (!text) {
    return null;
  }
  const matches = [];
  for (const pattern of TOOL_MISUSE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }
  return matches.length > 0 ? matches : null;
}

function buildReason(entity, matches) {
  return `Potential tool misuse/exploitation in ${entity}: ${matches.join(', ')}`;
}

export function scanAgentic02ToolMisuse(mcpData = {}) {
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
        issueType: 'Tool Misuse',
        name: tool?.name || 'tool',
        severity: 'high',
        reasons: [buildReason(`tool "${tool?.name || 'unknown'}"`, matches)],
        tags: ['tool-misuse', 'exploitation'],
        agenticCategory: OWASP_ID,
        safeUseNotes:
          'Review tool usage patterns. Ensure tools are used only within their intended scope.',
      });
    }
  }

  for (const resource of mcpData.resources || []) {
    const matches = scanText(resourceToText(resource));
    if (matches) {
      results.resourceFindings.push({
        issueType: 'Tool Misuse',
        uri: resource?.uri || resource?.name || 'resource',
        severity: 'medium',
        reasons: [
          buildReason(`resource "${resource?.name || resource?.uri || 'unknown'}"`, matches),
        ],
        tags: ['tool-misuse', 'exploitation'],
        agenticCategory: OWASP_ID,
      });
    }
  }

  for (const prompt of mcpData.prompts || []) {
    const matches = scanText(promptToText(prompt));
    if (matches) {
      results.promptFindings.push({
        issueType: 'Tool Misuse',
        name: prompt?.name || 'prompt',
        severity: 'high',
        reasons: [buildReason(`prompt "${prompt?.name || 'unknown'}"`, matches)],
        tags: ['tool-misuse', 'exploitation'],
        agenticCategory: OWASP_ID,
      });
    }
  }

  return results;
}

const adapter = createRuleAdapter(scanAgentic02ToolMisuse, RULE_ID, OWASP_ID, RECOMMENDATION);

export const analyzeTool = adapter.analyzeTool;
export const analyzePrompt = adapter.analyzePrompt;
export const analyzeResource = adapter.analyzeResource;

export function analyzePacket(packet) {
  const text = packetToText(packet);
  const matches = scanText(text);
  if (!matches) {
    return [];
  }
  return [
    convertPacketFinding(
      {
        issueType: 'Tool Misuse',
        severity: 'high',
        title: 'Tool Misuse Pattern in Traffic',
        description: `Potential tool misuse in packet: ${matches.join(', ')}`,
        evidence: matches[0]?.substring(0, 50) || '',
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
  name: 'Tool Misuse Detection',
  owasp_id: OWASP_ID,
  severity: 'high',
  description: 'Detects tool misuse and exploitation patterns.',
  source: 'static',
  type: 'agentic-security',
};
