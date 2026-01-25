import { convertPacketFinding, createRuleAdapter } from '../utils/adapter.js';
import { packetToText, promptToText, resourceToText, toolToText } from '../utils/text.js';

const RULE_ID = 'asi06-memory-poisoning';
const OWASP_ID = 'ASI06';
const RECOMMENDATION =
  'Implement memory and context validation. Monitor for data poisoning. Use memory isolation and sanitization.';

const MEMORY_POISONING_PATTERNS = [
  /(?:poison|corrupt|taint|contaminate|manipulate)\s+(?:memory|context|data|information)/i,
  /(?:inject|insert|inject)\s+(?:malicious|harmful|poisoned|corrupted)\s+(?:data|information|memory|context)/i,
  /(?:memory|context|data)\s+(?:poisoning|corruption|manipulation|tampering)/i,
  /(?:compromise|compromised)\s+(?:memory|context|data|information)/i,
  /(?:tainted|poisoned|corrupted)\s+(?:memory|context|data|information)/i,
];

function scanText(text) {
  if (!text) {
    return null;
  }
  const matches = [];
  for (const pattern of MEMORY_POISONING_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }
  return matches.length > 0 ? matches : null;
}

function buildReason(entity, matches) {
  return `Potential memory/context poisoning in ${entity}: ${matches.join(', ')}`;
}

export function scanAgentic06MemoryPoisoning(mcpData = {}) {
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
        issueType: 'Memory Poisoning',
        name: tool?.name || 'tool',
        severity: 'high',
        reasons: [buildReason(`tool "${tool?.name || 'unknown'}"`, matches)],
        tags: ['memory-poisoning', 'context-poisoning'],
        agenticCategory: OWASP_ID,
        safeUseNotes:
          'Review tool for memory poisoning vulnerabilities. Validate and sanitize all context data.',
      });
    }
  }

  for (const resource of mcpData.resources || []) {
    const matches = scanText(resourceToText(resource));
    if (matches) {
      results.resourceFindings.push({
        issueType: 'Memory Poisoning',
        uri: resource?.uri || resource?.name || 'resource',
        severity: 'high',
        reasons: [
          buildReason(`resource "${resource?.name || resource?.uri || 'unknown'}"`, matches),
        ],
        tags: ['memory-poisoning', 'context-poisoning'],
        agenticCategory: OWASP_ID,
      });
    }
  }

  for (const prompt of mcpData.prompts || []) {
    const matches = scanText(promptToText(prompt));
    if (matches) {
      results.promptFindings.push({
        issueType: 'Memory Poisoning',
        name: prompt?.name || 'prompt',
        severity: 'critical',
        reasons: [buildReason(`prompt "${prompt?.name || 'unknown'}"`, matches)],
        tags: ['memory-poisoning', 'context-poisoning'],
        agenticCategory: OWASP_ID,
      });
    }
  }

  return results;
}

const adapter = createRuleAdapter(scanAgentic06MemoryPoisoning, RULE_ID, OWASP_ID, RECOMMENDATION);

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
        issueType: 'Memory Poisoning',
        severity: 'high',
        title: 'Memory Poisoning Pattern in Traffic',
        description: `Potential memory/context poisoning in packet: ${matches.join(', ')}`,
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
  name: 'Memory Poisoning Detection',
  owasp_id: OWASP_ID,
  severity: 'high',
  description: 'Detects memory and context poisoning patterns.',
  source: 'static',
  type: 'agentic-security',
};
