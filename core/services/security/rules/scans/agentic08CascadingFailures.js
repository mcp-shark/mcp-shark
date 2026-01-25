import { convertPacketFinding, createRuleAdapter } from '../utils/adapter.js';
import { packetToText, promptToText, resourceToText, toolToText } from '../utils/text.js';

const RULE_ID = 'asi08-cascading-failures';
const OWASP_ID = 'ASI08';
const RECOMMENDATION =
  'Implement failure isolation and containment. Use circuit breakers and failover mechanisms. Design for graceful degradation.';

const CASCADING_FAILURE_PATTERNS = [
  /(?:cascade|cascading|chain|domino)\s+(?:failure|error|exception|outage|breakdown)/i,
  /(?:propagate|spread|ripple|amplify)\s+(?:failure|error|exception|outage)/i,
  /(?:single\s+point\s+of\s+failure|spof)/i,
  /(?:no|missing|lack|without)\s+(?:isolation|containment|circuit\s+breaker|failover|redundancy)/i,
  /(?:unhandled|uncaught|unrecoverable)\s+(?:failure|error|exception)/i,
];

function scanText(text) {
  if (!text) {
    return null;
  }
  const matches = [];
  for (const pattern of CASCADING_FAILURE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }
  return matches.length > 0 ? matches : null;
}

function buildReason(entity, matches) {
  return `Potential cascading failures in ${entity}: ${matches.join(', ')}`;
}

export function scanAgentic08CascadingFailures(mcpData = {}) {
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
        issueType: 'Cascading Failures',
        name: tool?.name || 'tool',
        severity: 'medium',
        reasons: [buildReason(`tool "${tool?.name || 'unknown'}"`, matches)],
        tags: ['cascading-failures', 'resilience'],
        agenticCategory: OWASP_ID,
        safeUseNotes:
          'Review tool failure handling. Implement isolation and circuit breakers to prevent cascading failures.',
      });
    }
  }

  for (const resource of mcpData.resources || []) {
    const matches = scanText(resourceToText(resource));
    if (matches) {
      results.resourceFindings.push({
        issueType: 'Cascading Failures',
        uri: resource?.uri || resource?.name || 'resource',
        severity: 'medium',
        reasons: [
          buildReason(`resource "${resource?.name || resource?.uri || 'unknown'}"`, matches),
        ],
        tags: ['cascading-failures', 'resilience'],
        agenticCategory: OWASP_ID,
      });
    }
  }

  for (const prompt of mcpData.prompts || []) {
    const matches = scanText(promptToText(prompt));
    if (matches) {
      results.promptFindings.push({
        issueType: 'Cascading Failures',
        name: prompt?.name || 'prompt',
        severity: 'low',
        reasons: [buildReason(`prompt "${prompt?.name || 'unknown'}"`, matches)],
        tags: ['cascading-failures', 'resilience'],
        agenticCategory: OWASP_ID,
      });
    }
  }

  return results;
}

const adapter = createRuleAdapter(
  scanAgentic08CascadingFailures,
  RULE_ID,
  OWASP_ID,
  RECOMMENDATION
);

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
        issueType: 'Cascading Failures',
        severity: 'medium',
        title: 'Cascading Failure Pattern in Traffic',
        description: `Potential cascading failure indicators in packet: ${matches.join(', ')}`,
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
  name: 'Cascading Failures Detection',
  owasp_id: OWASP_ID,
  severity: 'medium',
  description: 'Detects cascading failure vulnerabilities.',
  source: 'static',
  type: 'agentic-security',
};
