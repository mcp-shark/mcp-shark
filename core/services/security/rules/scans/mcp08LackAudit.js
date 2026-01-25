import { convertPacketFinding, createRuleAdapter } from '../utils/adapter.js';
import { packetToText, promptToText, resourceToText, toolToText } from '../utils/text.js';

const RULE_ID = 'mcp08-lack-audit';
const OWASP_ID = 'MCP08';
const RECOMMENDATION =
  'Implement comprehensive logging, audit trails, and telemetry. Monitor all tool usage and resource access.';

const LACK_AUDIT_PATTERNS = [
  /(?:no|missing|lack|absent|without)\s+(?:logging|log|audit|telemetry|monitoring|tracking)/i,
  /(?:disable|turn\s+off|remove)\s+(?:logging|log|audit|telemetry|monitoring)/i,
  /(?:silent|quiet|no\s+output)\s+(?:mode|operation|execution)/i,
  /(?:unlogged|unmonitored|untracked)\s+(?:action|operation|event|access)/i,
];

function scanText(text) {
  if (!text) {
    return null;
  }
  const matches = [];
  for (const pattern of LACK_AUDIT_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }
  return matches.length > 0 ? matches : null;
}

function buildReason(entity, matches) {
  return `Potential lack of audit/telemetry in ${entity}: ${matches.join(', ')}`;
}

export function scanMCP08LackAudit(mcpData = {}) {
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
        issueType: 'Lack Audit',
        name: tool?.name || 'tool',
        severity: 'medium',
        reasons: [buildReason(`tool "${tool?.name || 'unknown'}"`, matches)],
        tags: ['lack-audit', 'telemetry', 'logging'],
        mcpCategory: OWASP_ID,
        safeUseNotes:
          'Ensure tool operations are logged and audited. Implement telemetry for security monitoring.',
      });
    }
  }

  for (const resource of mcpData.resources || []) {
    const matches = scanText(resourceToText(resource));
    if (matches) {
      results.resourceFindings.push({
        issueType: 'Lack Audit',
        uri: resource?.uri || resource?.name || 'resource',
        severity: 'medium',
        reasons: [
          buildReason(`resource "${resource?.name || resource?.uri || 'unknown'}"`, matches),
        ],
        tags: ['lack-audit', 'telemetry', 'logging'],
        mcpCategory: OWASP_ID,
      });
    }
  }

  for (const prompt of mcpData.prompts || []) {
    const matches = scanText(promptToText(prompt));
    if (matches) {
      results.promptFindings.push({
        issueType: 'Lack Audit',
        name: prompt?.name || 'prompt',
        severity: 'low',
        reasons: [buildReason(`prompt "${prompt?.name || 'unknown'}"`, matches)],
        tags: ['lack-audit', 'telemetry', 'logging'],
        mcpCategory: OWASP_ID,
      });
    }
  }

  return results;
}

const adapter = createRuleAdapter(scanMCP08LackAudit, RULE_ID, OWASP_ID, RECOMMENDATION);

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
        issueType: 'Lack Audit',
        severity: 'medium',
        title: 'Audit Bypass Pattern in Traffic',
        description: `Potential audit bypass in packet: ${matches.join(', ')}`,
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
  name: 'Lack of Audit Detection',
  owasp_id: OWASP_ID,
  severity: 'medium',
  description: 'Detects potential lack of audit trails and telemetry.',
  source: 'static',
  type: 'owasp-mcp',
};
