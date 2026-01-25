import { convertPacketFinding, createRuleAdapter } from '../utils/adapter.js';
import { packetToText, promptToText, resourceToText, toolToText } from '../utils/text.js';

const RULE_ID = 'mcp10-context-injection';
const OWASP_ID = 'MCP10';
const RECOMMENDATION =
  'Implement context isolation and filtering. Limit context sharing between tools and servers. Validate all context data.';

const CONTEXT_INJECTION_PATTERNS = [
  /(?:over-share|overshare|excessive|too\s+much)\s+(?:context|information|data|details)/i,
  /(?:share|expose|reveal|leak)\s+(?:all|entire|full|complete|everything)\s+(?:context|information|data)/i,
  /(?:inject|insert|inject)\s+(?:context|information|data|payload)\s+(?:into|to|in)/i,
  /(?:context|information|data)\s+(?:injection|manipulation|tampering|poisoning)/i,
  /(?:unrestricted|unlimited|unfiltered)\s+(?:context|information|data)\s+(?:sharing|access|transfer)/i,
];

function scanText(text) {
  if (!text) {
    return null;
  }
  const matches = [];
  for (const pattern of CONTEXT_INJECTION_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }
  return matches.length > 0 ? matches : null;
}

function buildReason(entity, matches) {
  return `Potential context injection/over-sharing in ${entity}: ${matches.join(', ')}`;
}

export function scanMCP10ContextInjection(mcpData = {}) {
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
        issueType: 'Context Injection',
        name: tool?.name || 'tool',
        severity: 'medium',
        reasons: [buildReason(`tool "${tool?.name || 'unknown'}"`, matches)],
        tags: ['context-injection', 'over-sharing'],
        mcpCategory: OWASP_ID,
        safeUseNotes:
          'Review context sharing mechanisms. Ensure only necessary context is shared between tools.',
      });
    }
  }

  for (const resource of mcpData.resources || []) {
    const matches = scanText(resourceToText(resource));
    if (matches) {
      results.resourceFindings.push({
        issueType: 'Context Injection',
        uri: resource?.uri || resource?.name || 'resource',
        severity: 'medium',
        reasons: [
          buildReason(`resource "${resource?.name || resource?.uri || 'unknown'}"`, matches),
        ],
        tags: ['context-injection', 'over-sharing'],
        mcpCategory: OWASP_ID,
      });
    }
  }

  for (const prompt of mcpData.prompts || []) {
    const matches = scanText(promptToText(prompt));
    if (matches) {
      results.promptFindings.push({
        issueType: 'Context Injection',
        name: prompt?.name || 'prompt',
        severity: 'high',
        reasons: [buildReason(`prompt "${prompt?.name || 'unknown'}"`, matches)],
        tags: ['context-injection', 'over-sharing'],
        mcpCategory: OWASP_ID,
      });
    }
  }

  return results;
}

const adapter = createRuleAdapter(scanMCP10ContextInjection, RULE_ID, OWASP_ID, RECOMMENDATION);

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
        issueType: 'Context Injection',
        severity: 'medium',
        title: 'Context Injection Pattern in Traffic',
        description: `Potential context injection in packet: ${matches.join(', ')}`,
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
  name: 'Context Injection Detection',
  owasp_id: OWASP_ID,
  severity: 'medium',
  description: 'Detects context injection and over-sharing vulnerabilities.',
  source: 'static',
  type: 'owasp-mcp',
};
