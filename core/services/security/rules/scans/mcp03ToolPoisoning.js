import { convertPacketFinding, createRuleAdapter } from '../utils/adapter.js';
import { packetToText, promptToText, resourceToText, toolToText } from '../utils/text.js';

const RULE_ID = 'mcp03-tool-poisoning';
const OWASP_ID = 'MCP03';
const RECOMMENDATION =
  'Verify tool authenticity and integrity. Implement tool signing and verification mechanisms. Monitor for suspicious tool behavior.';

const TOOL_POISONING_PATTERNS = [
  /(?:malicious|harmful|dangerous|exploit|attack|backdoor|trojan|virus)/i,
  /(?:unauthorized|illegitimate|fake|spoofed|forged|tampered)/i,
  /(?:steal|exfiltrate|leak|extract)\s+(?:data|information|credentials|secrets)/i,
  /(?:delete|remove|destroy|wipe|erase)\s+(?:file|data|information)/i,
  /(?:override|bypass|disable)\s+(?:security|protection|safeguard|control)/i,
  /(?:hidden|concealed|obfuscated|encoded)\s+(?:functionality|behavior|action)/i,
];

function scanText(text) {
  if (!text) {
    return null;
  }
  const matches = [];
  for (const pattern of TOOL_POISONING_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }
  return matches.length > 0 ? matches : null;
}

function buildReason(entity, matches) {
  return `Potential tool poisoning indicators in ${entity}: ${matches.join(', ')}`;
}

export function scanMCP03ToolPoisoning(mcpData = {}) {
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
        issueType: 'Tool Poisoning',
        name: tool?.name || 'tool',
        severity: 'high',
        reasons: [buildReason(`tool "${tool?.name || 'unknown'}"`, matches)],
        tags: ['tool-poisoning', 'malicious'],
        mcpCategory: OWASP_ID,
        is_potentially_poisoned: true,
        safeUseNotes:
          'Review tool description and behavior carefully. Verify tool source and integrity before use.',
      });
    }
  }

  for (const resource of mcpData.resources || []) {
    const matches = scanText(resourceToText(resource));
    if (matches) {
      results.resourceFindings.push({
        issueType: 'Tool Poisoning',
        uri: resource?.uri || resource?.name || 'resource',
        severity: 'high',
        reasons: [
          buildReason(`resource "${resource?.name || resource?.uri || 'unknown'}"`, matches),
        ],
        tags: ['tool-poisoning', 'malicious'],
        mcpCategory: OWASP_ID,
      });
    }
  }

  for (const prompt of mcpData.prompts || []) {
    const matches = scanText(promptToText(prompt));
    if (matches) {
      results.promptFindings.push({
        issueType: 'Tool Poisoning',
        name: prompt?.name || 'prompt',
        severity: 'medium',
        reasons: [buildReason(`prompt "${prompt?.name || 'unknown'}"`, matches)],
        tags: ['tool-poisoning', 'malicious'],
        mcpCategory: OWASP_ID,
      });
    }
  }

  return results;
}

const adapter = createRuleAdapter(scanMCP03ToolPoisoning, RULE_ID, OWASP_ID, RECOMMENDATION);

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
        issueType: 'Tool Poisoning',
        severity: 'high',
        title: 'Tool Poisoning Pattern in Traffic',
        description: `Potential malicious pattern in packet: ${matches.join(', ')}`,
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
  name: 'Tool Poisoning Detection',
  owasp_id: OWASP_ID,
  severity: 'high',
  description: 'Detects malicious patterns that could indicate tool poisoning attacks.',
  source: 'static',
  type: 'owasp-mcp',
};
