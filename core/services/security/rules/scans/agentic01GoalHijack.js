import { convertPacketFinding, createRuleAdapter } from '../utils/adapter.js';
import { packetToText, promptToText, resourceToText, toolToText } from '../utils/text.js';

const RULE_ID = 'asi01-goal-hijack';
const OWASP_ID = 'ASI01';
const RECOMMENDATION =
  'Implement goal validation and verification. Monitor for unauthorized goal changes. Use goal isolation and protection mechanisms.';

const GOAL_HIJACK_PATTERNS = [
  /(?:hijack|override|replace|change|modify)\s+(?:goal|objective|purpose|mission|task)/i,
  /(?:ignore|forget|disregard)\s+(?:original|initial|intended|primary)\s+(?:goal|objective|purpose)/i,
  /(?:new|different|alternative|malicious)\s+(?:goal|objective|purpose|mission)/i,
  /(?:steer|redirect|manipulate)\s+(?:agent|system)\s+(?:toward|to|into)/i,
  /(?:unauthorized|malicious|harmful)\s+(?:goal|objective|purpose|action)/i,
];

function scanText(text) {
  if (!text) {
    return null;
  }
  const matches = [];
  for (const pattern of GOAL_HIJACK_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }
  return matches.length > 0 ? matches : null;
}

function buildReason(entity, matches) {
  return `Potential agent goal hijack in ${entity}: ${matches.join(', ')}`;
}

export function scanAgentic01GoalHijack(mcpData = {}) {
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
        issueType: 'Goal Hijack',
        name: tool?.name || 'tool',
        severity: 'high',
        reasons: [buildReason(`tool "${tool?.name || 'unknown'}"`, matches)],
        tags: ['goal-hijack', 'agent-manipulation'],
        agenticCategory: OWASP_ID,
        safeUseNotes:
          'Review tool behavior for goal hijacking vulnerabilities. Ensure agent goals cannot be modified by tools.',
      });
    }
  }

  for (const resource of mcpData.resources || []) {
    const matches = scanText(resourceToText(resource));
    if (matches) {
      results.resourceFindings.push({
        issueType: 'Goal Hijack',
        uri: resource?.uri || resource?.name || 'resource',
        severity: 'high',
        reasons: [
          buildReason(`resource "${resource?.name || resource?.uri || 'unknown'}"`, matches),
        ],
        tags: ['goal-hijack', 'agent-manipulation'],
        agenticCategory: OWASP_ID,
      });
    }
  }

  for (const prompt of mcpData.prompts || []) {
    const matches = scanText(promptToText(prompt));
    if (matches) {
      results.promptFindings.push({
        issueType: 'Goal Hijack',
        name: prompt?.name || 'prompt',
        severity: 'critical',
        reasons: [buildReason(`prompt "${prompt?.name || 'unknown'}"`, matches)],
        tags: ['goal-hijack', 'agent-manipulation'],
        agenticCategory: OWASP_ID,
      });
    }
  }

  return results;
}

const adapter = createRuleAdapter(scanAgentic01GoalHijack, RULE_ID, OWASP_ID, RECOMMENDATION);

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
        issueType: 'Goal Hijack',
        severity: 'high',
        title: 'Goal Hijack Pattern in Traffic',
        description: `Potential agent goal hijack in packet: ${matches.join(', ')}`,
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
  name: 'Agent Goal Hijack Detection',
  owasp_id: OWASP_ID,
  severity: 'high',
  description: 'Detects attempts to hijack or modify agent goals.',
  source: 'static',
  type: 'agentic-security',
};
