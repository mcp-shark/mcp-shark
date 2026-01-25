import { convertPacketFinding, createRuleAdapter } from '../utils/adapter.js';
import { packetToText, promptToText, resourceToText, toolToText } from '../utils/text.js';

const RULE_ID = 'asi10-rogue-agent';
const OWASP_ID = 'ASI10';
const RECOMMENDATION =
  'Implement agent registration and approval processes. Monitor for unauthorized agent creation. Enforce agent lifecycle management.';

const ROGUE_AGENT_PATTERNS = [
  /(?:rogue|unauthorized|unapproved|malicious|harmful)\s+(?:agent|bot|automation|system)/i,
  /(?:unauthorized|unapproved|unmanaged)\s+(?:agent|bot)\s+(?:creation|deployment|execution|activation)/i,
  /(?:bypass|circumvent|avoid)\s+(?:approval|authorization|review|governance)\s+(?:for|to\s+create|to\s+deploy)/i,
  /(?:hidden|concealed|undocumented|unregistered)\s+(?:agent|bot|automation)/i,
  /(?:self-replicating|self-propagating|autonomous)\s+(?:agent|bot)\s+(?:without|lacking)/i,
];

function scanText(text) {
  if (!text) {
    return null;
  }
  const matches = [];
  for (const pattern of ROGUE_AGENT_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }
  return matches.length > 0 ? matches : null;
}

function buildReason(entity, matches) {
  return `Potential rogue agent indicators in ${entity}: ${matches.join(', ')}`;
}

export function scanAgentic10RogueAgent(mcpData = {}) {
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
        issueType: 'Rogue Agent',
        name: tool?.name || 'tool',
        severity: 'critical',
        reasons: [buildReason(`tool "${tool?.name || 'unknown'}"`, matches)],
        tags: ['rogue-agent', 'unauthorized'],
        agenticCategory: OWASP_ID,
        safeUseNotes:
          'Verify agent registration and approval status. Ensure all agents are properly managed and monitored.',
      });
    }
  }

  for (const resource of mcpData.resources || []) {
    const matches = scanText(resourceToText(resource));
    if (matches) {
      results.resourceFindings.push({
        issueType: 'Rogue Agent',
        uri: resource?.uri || resource?.name || 'resource',
        severity: 'critical',
        reasons: [
          buildReason(`resource "${resource?.name || resource?.uri || 'unknown'}"`, matches),
        ],
        tags: ['rogue-agent', 'unauthorized'],
        agenticCategory: OWASP_ID,
      });
    }
  }

  for (const prompt of mcpData.prompts || []) {
    const matches = scanText(promptToText(prompt));
    if (matches) {
      results.promptFindings.push({
        issueType: 'Rogue Agent',
        name: prompt?.name || 'prompt',
        severity: 'high',
        reasons: [buildReason(`prompt "${prompt?.name || 'unknown'}"`, matches)],
        tags: ['rogue-agent', 'unauthorized'],
        agenticCategory: OWASP_ID,
      });
    }
  }

  return results;
}

const adapter = createRuleAdapter(scanAgentic10RogueAgent, RULE_ID, OWASP_ID, RECOMMENDATION);

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
        issueType: 'Rogue Agent',
        severity: 'critical',
        title: 'Rogue Agent Pattern in Traffic',
        description: `Potential rogue agent indicators in packet: ${matches.join(', ')}`,
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
  name: 'Rogue Agent Detection',
  owasp_id: OWASP_ID,
  severity: 'critical',
  description: 'Detects rogue agent vulnerabilities.',
  source: 'static',
  type: 'agentic-security',
};
