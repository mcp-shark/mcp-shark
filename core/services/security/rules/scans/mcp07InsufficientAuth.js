import { convertPacketFinding, createRuleAdapter } from '../utils/adapter.js';
import { packetToText, promptToText, resourceToText, toolToText } from '../utils/text.js';

const RULE_ID = 'mcp07-insufficient-auth';
const OWASP_ID = 'MCP07';
const RECOMMENDATION =
  'Implement proper authentication and authorization mechanisms. Enforce access controls for all tools and resources.';

const INSUFFICIENT_AUTH_PATTERNS = [
  /(?:no|missing|lack|absent|without)\s+(?:authentication|auth|authorization|authz|access\s+control)/i,
  /(?:public|open|unrestricted|unprotected|unsecured)\s+(?:access|endpoint|api|tool|resource)/i,
  /(?:anonymous|guest|unauthenticated)\s+(?:user|access|request)/i,
  /(?:skip|bypass|ignore|disable)\s+(?:authentication|auth|authorization|check|validation)/i,
  /(?:weak|insecure|poor|insufficient)\s+(?:authentication|auth|authorization|security)/i,
];

function scanText(text) {
  if (!text) {
    return null;
  }
  const matches = [];
  for (const pattern of INSUFFICIENT_AUTH_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }
  return matches.length > 0 ? matches : null;
}

function buildReason(entity, matches) {
  return `Potential insufficient authentication/authorization in ${entity}: ${matches.join(', ')}`;
}

export function scanMCP07InsufficientAuth(mcpData = {}) {
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
        issueType: 'Insufficient Auth',
        name: tool?.name || 'tool',
        severity: 'high',
        reasons: [buildReason(`tool "${tool?.name || 'unknown'}"`, matches)],
        tags: ['insufficient-auth', 'authentication', 'authorization'],
        mcpCategory: OWASP_ID,
        safeUseNotes:
          'Review tool authentication requirements. Ensure proper access controls are in place.',
      });
    }
  }

  for (const resource of mcpData.resources || []) {
    const matches = scanText(resourceToText(resource));
    if (matches) {
      results.resourceFindings.push({
        issueType: 'Insufficient Auth',
        uri: resource?.uri || resource?.name || 'resource',
        severity: 'high',
        reasons: [
          buildReason(`resource "${resource?.name || resource?.uri || 'unknown'}"`, matches),
        ],
        tags: ['insufficient-auth', 'authentication', 'authorization'],
        mcpCategory: OWASP_ID,
      });
    }
  }

  for (const prompt of mcpData.prompts || []) {
    const matches = scanText(promptToText(prompt));
    if (matches) {
      results.promptFindings.push({
        issueType: 'Insufficient Auth',
        name: prompt?.name || 'prompt',
        severity: 'medium',
        reasons: [buildReason(`prompt "${prompt?.name || 'unknown'}"`, matches)],
        tags: ['insufficient-auth', 'authentication', 'authorization'],
        mcpCategory: OWASP_ID,
      });
    }
  }

  return results;
}

const adapter = createRuleAdapter(scanMCP07InsufficientAuth, RULE_ID, OWASP_ID, RECOMMENDATION);

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
        issueType: 'Insufficient Auth',
        severity: 'high',
        title: 'Insufficient Auth Pattern in Traffic',
        description: `Potential authentication weakness in packet: ${matches.join(', ')}`,
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
  name: 'Insufficient Authentication Detection',
  owasp_id: OWASP_ID,
  severity: 'high',
  description: 'Detects potential authentication and authorization weaknesses.',
  source: 'static',
  type: 'owasp-mcp',
};
