import { convertPacketFinding, createRuleAdapter } from '../utils/adapter.js';
import { packetToText, promptToText, resourceToText, toolToText } from '../utils/text.js';

const RULE_ID = 'asi07-insecure-communication';
const OWASP_ID = 'ASI07';
const RECOMMENDATION =
  'Implement encrypted communication channels. Use TLS/SSL for all inter-agent communications. Authenticate all agent interactions.';

const INSECURE_COMMUNICATION_PATTERNS = [
  /(?:unencrypted|plaintext|cleartext|unsecured)\s+(?:communication|channel|connection|transmission)/i,
  /(?:http:\/\/|ftp:\/\/|ws:\/\/)\s+(?:instead\s+of|without|missing)/i,
  /(?:no|missing|lack|without)\s+(?:encryption|tls|ssl|https|authentication|auth)/i,
  /(?:insecure|vulnerable|weak)\s+(?:communication|channel|protocol|connection)/i,
  /(?:intercept|eavesdrop|man-in-the-middle|mitm)\s+(?:communication|channel|message)/i,
];

function scanText(text) {
  if (!text) {
    return null;
  }
  const matches = [];
  for (const pattern of INSECURE_COMMUNICATION_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }
  return matches.length > 0 ? matches : null;
}

function buildReason(entity, matches) {
  return `Potential insecure inter-agent communication in ${entity}: ${matches.join(', ')}`;
}

export function scanAgentic07InsecureCommunication(mcpData = {}) {
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
        issueType: 'Insecure Communication',
        name: tool?.name || 'tool',
        severity: 'high',
        reasons: [buildReason(`tool "${tool?.name || 'unknown'}"`, matches)],
        tags: ['insecure-communication', 'inter-agent'],
        agenticCategory: OWASP_ID,
        safeUseNotes:
          'Review tool communication mechanisms. Ensure all inter-agent communications are encrypted and authenticated.',
      });
    }
  }

  for (const resource of mcpData.resources || []) {
    const matches = scanText(resourceToText(resource));
    if (matches) {
      results.resourceFindings.push({
        issueType: 'Insecure Communication',
        uri: resource?.uri || resource?.name || 'resource',
        severity: 'high',
        reasons: [
          buildReason(`resource "${resource?.name || resource?.uri || 'unknown'}"`, matches),
        ],
        tags: ['insecure-communication', 'inter-agent'],
        agenticCategory: OWASP_ID,
      });
    }
  }

  for (const prompt of mcpData.prompts || []) {
    const matches = scanText(promptToText(prompt));
    if (matches) {
      results.promptFindings.push({
        issueType: 'Insecure Communication',
        name: prompt?.name || 'prompt',
        severity: 'medium',
        reasons: [buildReason(`prompt "${prompt?.name || 'unknown'}"`, matches)],
        tags: ['insecure-communication', 'inter-agent'],
        agenticCategory: OWASP_ID,
      });
    }
  }

  return results;
}

const adapter = createRuleAdapter(
  scanAgentic07InsecureCommunication,
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
        issueType: 'Insecure Communication',
        severity: 'high',
        title: 'Insecure Communication Pattern in Traffic',
        description: `Potential insecure communication in packet: ${matches.join(', ')}`,
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
  name: 'Insecure Communication Detection',
  owasp_id: OWASP_ID,
  severity: 'high',
  description: 'Detects insecure inter-agent communication patterns.',
  source: 'static',
  type: 'agentic-security',
};
