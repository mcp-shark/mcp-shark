import { convertPacketFinding, createRuleAdapter } from '../utils/adapter.js';
import { packetToText, promptToText, resourceToText, toolToText } from '../utils/text.js';

const RULE_ID = 'mcp04-supply-chain';
const OWASP_ID = 'MCP04';
const RECOMMENDATION =
  'Pin all dependencies to specific versions. Verify package integrity and signatures. Use trusted repositories and registries.';

const SUPPLY_CHAIN_PATTERNS = [
  /(?:unsigned|unverified|untrusted|unauthenticated)\s+(?:package|dependency|module|library)/i,
  /(?:tampered|modified|altered|compromised)\s+(?:package|dependency|module|library)/i,
  /(?:dependency|package|module)\s+(?:confusion|substitution|hijacking)/i,
  /(?:typosquatting|brandjacking|namespace)\s+(?:package|dependency|module)/i,
  /(?:unpinned|floating|wildcard)\s+(?:version|dependency|package)/i,
  /(?:from|source)\s+(?:unknown|unverified|suspicious|untrusted)\s+(?:source|repository|registry)/i,
];

function scanText(text) {
  if (!text) {
    return null;
  }
  const matches = [];
  for (const pattern of SUPPLY_CHAIN_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }
  return matches.length > 0 ? matches : null;
}

function buildReason(entity, matches) {
  return `Potential supply chain vulnerability in ${entity}: ${matches.join(', ')}`;
}

export function scanMCP04SupplyChain(mcpData = {}) {
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
        issueType: 'Supply Chain',
        name: tool?.name || 'tool',
        severity: 'high',
        reasons: [buildReason(`tool "${tool?.name || 'unknown'}"`, matches)],
        tags: ['supply-chain', 'dependency-tampering'],
        mcpCategory: OWASP_ID,
        safeUseNotes:
          'Verify all dependencies and packages. Use signed packages from trusted sources.',
      });
    }
  }

  for (const resource of mcpData.resources || []) {
    const matches = scanText(resourceToText(resource));
    if (matches) {
      results.resourceFindings.push({
        issueType: 'Supply Chain',
        uri: resource?.uri || resource?.name || 'resource',
        severity: 'high',
        reasons: [
          buildReason(`resource "${resource?.name || resource?.uri || 'unknown'}"`, matches),
        ],
        tags: ['supply-chain', 'dependency-tampering'],
        mcpCategory: OWASP_ID,
      });
    }
  }

  for (const prompt of mcpData.prompts || []) {
    const matches = scanText(promptToText(prompt));
    if (matches) {
      results.promptFindings.push({
        issueType: 'Supply Chain',
        name: prompt?.name || 'prompt',
        severity: 'medium',
        reasons: [buildReason(`prompt "${prompt?.name || 'unknown'}"`, matches)],
        tags: ['supply-chain', 'dependency-tampering'],
        mcpCategory: OWASP_ID,
      });
    }
  }

  return results;
}

const adapter = createRuleAdapter(scanMCP04SupplyChain, RULE_ID, OWASP_ID, RECOMMENDATION);

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
        issueType: 'Supply Chain',
        severity: 'high',
        title: 'Supply Chain Pattern in Traffic',
        description: `Potential supply chain vulnerability in packet: ${matches.join(', ')}`,
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
  name: 'Supply Chain Vulnerability Detection',
  owasp_id: OWASP_ID,
  severity: 'high',
  description: 'Detects potential supply chain vulnerabilities in MCP configurations.',
  source: 'static',
  type: 'owasp-mcp',
};
