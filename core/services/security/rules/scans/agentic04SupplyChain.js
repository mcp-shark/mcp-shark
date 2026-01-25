import { convertPacketFinding, createRuleAdapter } from '../utils/adapter.js';
import { packetToText, promptToText, resourceToText, toolToText } from '../utils/text.js';

const RULE_ID = 'asi04-supply-chain';
const OWASP_ID = 'ASI04';
const RECOMMENDATION =
  'Verify agent framework and model integrity. Use signed and verified dependencies. Monitor for supply chain attacks.';

const AGENTIC_SUPPLY_CHAIN_PATTERNS = [
  /(?:compromised|vulnerable|malicious)\s+(?:agent|framework|model|dependency|package)/i,
  /(?:supply\s+chain|dependency)\s+(?:attack|vulnerability|compromise|tampering)/i,
  /(?:unsigned|unverified|untrusted)\s+(?:agent|framework|model|dependency)/i,
  /(?:tampered|modified|altered)\s+(?:agent|framework|model|dependency)/i,
  /(?:typosquatting|brandjacking|namespace)\s+(?:agent|framework|model|package)/i,
];

function scanText(text) {
  if (!text) {
    return null;
  }
  const matches = [];
  for (const pattern of AGENTIC_SUPPLY_CHAIN_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }
  return matches.length > 0 ? matches : null;
}

function buildReason(entity, matches) {
  return `Potential agentic supply chain vulnerability in ${entity}: ${matches.join(', ')}`;
}

export function scanAgentic04SupplyChain(mcpData = {}) {
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
        issueType: 'Supply Chain Agentic',
        name: tool?.name || 'tool',
        severity: 'high',
        reasons: [buildReason(`tool "${tool?.name || 'unknown'}"`, matches)],
        tags: ['supply-chain', 'agentic'],
        agenticCategory: OWASP_ID,
        safeUseNotes:
          'Verify agent framework and dependencies. Use trusted sources and verify integrity.',
      });
    }
  }

  for (const resource of mcpData.resources || []) {
    const matches = scanText(resourceToText(resource));
    if (matches) {
      results.resourceFindings.push({
        issueType: 'Supply Chain Agentic',
        uri: resource?.uri || resource?.name || 'resource',
        severity: 'high',
        reasons: [
          buildReason(`resource "${resource?.name || resource?.uri || 'unknown'}"`, matches),
        ],
        tags: ['supply-chain', 'agentic'],
        agenticCategory: OWASP_ID,
      });
    }
  }

  for (const prompt of mcpData.prompts || []) {
    const matches = scanText(promptToText(prompt));
    if (matches) {
      results.promptFindings.push({
        issueType: 'Supply Chain Agentic',
        name: prompt?.name || 'prompt',
        severity: 'medium',
        reasons: [buildReason(`prompt "${prompt?.name || 'unknown'}"`, matches)],
        tags: ['supply-chain', 'agentic'],
        agenticCategory: OWASP_ID,
      });
    }
  }

  return results;
}

const adapter = createRuleAdapter(scanAgentic04SupplyChain, RULE_ID, OWASP_ID, RECOMMENDATION);

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
        issueType: 'Supply Chain Agentic',
        severity: 'high',
        title: 'Agentic Supply Chain Pattern in Traffic',
        description: `Potential agentic supply chain vulnerability in packet: ${matches.join(', ')}`,
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
  name: 'Agentic Supply Chain Detection',
  owasp_id: OWASP_ID,
  severity: 'high',
  description: 'Detects agentic supply chain vulnerabilities.',
  source: 'static',
  type: 'agentic-security',
};
