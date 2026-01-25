import { convertPacketFinding, createRuleAdapter } from '../utils/adapter.js';
import { packetToText, promptToText, resourceToText, toolToText } from '../utils/text.js';

const RULE_ID = 'asi03-identity-abuse';
const OWASP_ID = 'ASI03';
const RECOMMENDATION =
  'Implement strict identity and privilege management. Monitor for privilege escalation. Enforce least privilege principles.';

const IDENTITY_ABUSE_PATTERNS = [
  /(?:abuse|misuse|exploit|impersonate|spoof)\s+(?:identity|privilege|permission|access|role)/i,
  /(?:escalate|elevate|raise|upgrade)\s+(?:privilege|permission|access|authority)/i,
  /(?:assume|take|steal|hijack)\s+(?:identity|role|privilege|permission)/i,
  /(?:unauthorized|illegitimate|improper)\s+(?:privilege|permission|access|authority)\s+(?:use|usage|exercise)/i,
  /(?:bypass|circumvent|override)\s+(?:identity|authentication|authorization|access\s+control)/i,
];

function scanText(text) {
  if (!text) {
    return null;
  }
  const matches = [];
  for (const pattern of IDENTITY_ABUSE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }
  return matches.length > 0 ? matches : null;
}

function buildReason(entity, matches) {
  return `Potential identity/privilege abuse in ${entity}: ${matches.join(', ')}`;
}

export function scanAgentic03IdentityAbuse(mcpData = {}) {
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
        issueType: 'Identity Abuse',
        name: tool?.name || 'tool',
        severity: 'high',
        reasons: [buildReason(`tool "${tool?.name || 'unknown'}"`, matches)],
        tags: ['identity-abuse', 'privilege-abuse'],
        agenticCategory: OWASP_ID,
        safeUseNotes:
          'Review tool privilege requirements. Ensure agents cannot abuse their assigned identities or privileges.',
      });
    }
  }

  for (const resource of mcpData.resources || []) {
    const matches = scanText(resourceToText(resource));
    if (matches) {
      results.resourceFindings.push({
        issueType: 'Identity Abuse',
        uri: resource?.uri || resource?.name || 'resource',
        severity: 'high',
        reasons: [
          buildReason(`resource "${resource?.name || resource?.uri || 'unknown'}"`, matches),
        ],
        tags: ['identity-abuse', 'privilege-abuse'],
        agenticCategory: OWASP_ID,
      });
    }
  }

  for (const prompt of mcpData.prompts || []) {
    const matches = scanText(promptToText(prompt));
    if (matches) {
      results.promptFindings.push({
        issueType: 'Identity Abuse',
        name: prompt?.name || 'prompt',
        severity: 'medium',
        reasons: [buildReason(`prompt "${prompt?.name || 'unknown'}"`, matches)],
        tags: ['identity-abuse', 'privilege-abuse'],
        agenticCategory: OWASP_ID,
      });
    }
  }

  return results;
}

const adapter = createRuleAdapter(scanAgentic03IdentityAbuse, RULE_ID, OWASP_ID, RECOMMENDATION);

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
        issueType: 'Identity Abuse',
        severity: 'high',
        title: 'Identity Abuse Pattern in Traffic',
        description: `Potential identity/privilege abuse in packet: ${matches.join(', ')}`,
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
  name: 'Identity Abuse Detection',
  owasp_id: OWASP_ID,
  severity: 'high',
  description: 'Detects identity and privilege abuse patterns.',
  source: 'static',
  type: 'agentic-security',
};
