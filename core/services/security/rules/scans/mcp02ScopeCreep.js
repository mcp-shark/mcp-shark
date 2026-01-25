import { convertPacketFinding, createRuleAdapter } from '../utils/adapter.js';
import { packetToText, promptToText, resourceToText, toolToText } from '../utils/text.js';

const RULE_ID = 'mcp02-scope-creep';
const OWASP_ID = 'MCP02';
const RECOMMENDATION =
  'Implement strict scope boundaries for tools. Monitor for unauthorized scope expansion and enforce least privilege principles.';

const SCOPE_CREEP_PATTERNS = [
  /(?:expand|extend|increase|broaden|widen)\s+(?:scope|permission|access|capability|authority)/i,
  /(?:additional|extra|more|further)\s+(?:privilege|permission|access|right)/i,
  /(?:escalate|elevate|raise|upgrade)\s+(?:privilege|permission|access|level)/i,
  /(?:unrestricted|unlimited|full|complete|total)\s+(?:access|permission|privilege|control)/i,
  /(?:bypass|override|circumvent)\s+(?:restriction|limit|constraint|control)/i,
];

function scanText(text) {
  if (!text) {
    return null;
  }
  const matches = [];
  for (const pattern of SCOPE_CREEP_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }
  return matches.length > 0 ? matches : null;
}

function buildReason(entity, matches) {
  return `Potential scope creep detected in ${entity}: ${matches.join(', ')}`;
}

export function scanMCP02ScopeCreep(mcpData = {}) {
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
        issueType: 'Scope Creep',
        name: tool?.name || 'tool',
        severity: 'medium',
        reasons: [buildReason(`tool "${tool?.name || 'unknown'}"`, matches)],
        tags: ['scope-creep', 'privilege-escalation'],
        mcpCategory: OWASP_ID,
        safeUseNotes:
          'Review tool scope boundaries. Ensure tools cannot expand their permissions beyond intended limits.',
      });
    }
  }

  for (const resource of mcpData.resources || []) {
    const matches = scanText(resourceToText(resource));
    if (matches) {
      results.resourceFindings.push({
        issueType: 'Scope Creep',
        uri: resource?.uri || resource?.name || 'resource',
        severity: 'medium',
        reasons: [
          buildReason(`resource "${resource?.name || resource?.uri || 'unknown'}"`, matches),
        ],
        tags: ['scope-creep', 'privilege-escalation'],
        mcpCategory: OWASP_ID,
      });
    }
  }

  for (const prompt of mcpData.prompts || []) {
    const matches = scanText(promptToText(prompt));
    if (matches) {
      results.promptFindings.push({
        issueType: 'Scope Creep',
        name: prompt?.name || 'prompt',
        severity: 'low',
        reasons: [buildReason(`prompt "${prompt?.name || 'unknown'}"`, matches)],
        tags: ['scope-creep', 'privilege-escalation'],
        mcpCategory: OWASP_ID,
      });
    }
  }

  return results;
}

const adapter = createRuleAdapter(scanMCP02ScopeCreep, RULE_ID, OWASP_ID, RECOMMENDATION);

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
        issueType: 'Scope Creep',
        severity: 'medium',
        title: 'Scope Creep Pattern in Traffic',
        description: `Potential scope creep in packet: ${matches.join(', ')}`,
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
  name: 'Scope Creep Detection',
  owasp_id: OWASP_ID,
  severity: 'medium',
  description: 'Detects potential privilege escalation via scope creep in tool definitions.',
  source: 'static',
  type: 'owasp-mcp',
};
