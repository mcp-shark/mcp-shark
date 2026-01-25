import { convertPacketFinding, createRuleAdapter } from '../utils/adapter.js';
import { packetToText, promptToText, resourceToText, toolToText } from '../utils/text.js';

const RULE_ID = 'mcp09-shadow-servers';
const OWASP_ID = 'MCP09';
const RECOMMENDATION =
  'Maintain an inventory of all MCP servers. Implement server registration and approval processes. Monitor for unauthorized deployments.';

const SHADOW_SERVER_PATTERNS = [
  /(?:unauthorized|unmanaged|unapproved|unofficial|unofficial)\s+(?:server|service|instance|deployment)/i,
  /(?:shadow|rogue|hidden|concealed|undocumented)\s+(?:server|service|instance|deployment)/i,
  /(?:bypass|circumvent|avoid)\s+(?:approval|review|governance|management|control)/i,
  /(?:unregistered|unlisted|unmonitored)\s+(?:server|service|instance|deployment)/i,
];

function scanText(text) {
  if (!text) {
    return null;
  }
  const matches = [];
  for (const pattern of SHADOW_SERVER_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }
  return matches.length > 0 ? matches : null;
}

function buildReason(entity, matches) {
  return `Potential shadow MCP server indicators in ${entity}: ${matches.join(', ')}`;
}

export function scanMCP09ShadowServers(mcpData = {}) {
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
        issueType: 'Shadow Server',
        name: tool?.name || 'tool',
        severity: 'high',
        reasons: [buildReason(`tool "${tool?.name || 'unknown'}"`, matches)],
        tags: ['shadow-server', 'unauthorized'],
        mcpCategory: OWASP_ID,
        safeUseNotes:
          'Verify server registration and approval status. Ensure all servers are properly managed and monitored.',
      });
    }
  }

  for (const resource of mcpData.resources || []) {
    const matches = scanText(resourceToText(resource));
    if (matches) {
      results.resourceFindings.push({
        issueType: 'Shadow Server',
        uri: resource?.uri || resource?.name || 'resource',
        severity: 'high',
        reasons: [
          buildReason(`resource "${resource?.name || resource?.uri || 'unknown'}"`, matches),
        ],
        tags: ['shadow-server', 'unauthorized'],
        mcpCategory: OWASP_ID,
      });
    }
  }

  for (const prompt of mcpData.prompts || []) {
    const matches = scanText(promptToText(prompt));
    if (matches) {
      results.promptFindings.push({
        issueType: 'Shadow Server',
        name: prompt?.name || 'prompt',
        severity: 'medium',
        reasons: [buildReason(`prompt "${prompt?.name || 'unknown'}"`, matches)],
        tags: ['shadow-server', 'unauthorized'],
        mcpCategory: OWASP_ID,
      });
    }
  }

  return results;
}

const adapter = createRuleAdapter(scanMCP09ShadowServers, RULE_ID, OWASP_ID, RECOMMENDATION);

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
        issueType: 'Shadow Server',
        severity: 'high',
        title: 'Shadow Server Pattern in Traffic',
        description: `Potential shadow server indicators in packet: ${matches.join(', ')}`,
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
  name: 'Shadow Server Detection',
  owasp_id: OWASP_ID,
  severity: 'high',
  description: 'Detects potential unauthorized or shadow MCP server deployments.',
  source: 'static',
  type: 'owasp-mcp',
};
