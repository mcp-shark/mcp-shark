/**
 * DNS Rebinding Detection
 * Detects MCP servers bound to 0.0.0.0 or all interfaces,
 * which are vulnerable to DNS rebinding attacks.
 * Catalog reference: §1.6
 */
import { createRuleAdapter } from '../utils/adapter.js';
import { toolToText } from '../utils/text.js';

const RULE_ID = 'dns-rebinding';
const OWASP_ID = 'MCP07';
const RECOMMENDATION =
  'Bind MCP servers to 127.0.0.1 or localhost instead of 0.0.0.0. Use --host 127.0.0.1 flag.';

const BIND_ALL_PATTERNS = [
  /0\.0\.0\.0/,
  /--host\s+0\.0\.0\.0/i,
  /HOST[=:]\s*0\.0\.0\.0/,
  /listen\(['"]0\.0\.0\.0['"]/,
  /INADDR_ANY/,
];

function scanForDnsRebinding(text) {
  if (!text) {
    return null;
  }
  for (const pattern of BIND_ALL_PATTERNS) {
    if (pattern.test(text)) {
      return { pattern: pattern.source };
    }
  }
  return null;
}

export function scanDnsRebinding(mcpData = {}) {
  const results = {
    toolFindings: [],
    resourceFindings: [],
    promptFindings: [],
    notablePatterns: [],
    recommendations: [RECOMMENDATION],
  };

  for (const tool of mcpData.tools || []) {
    const hit = scanForDnsRebinding(toolToText(tool));
    if (hit) {
      results.toolFindings.push({
        issueType: 'DNS Rebinding Risk',
        name: tool?.name || 'tool',
        severity: 'high',
        reasons: [
          `Tool "${tool?.name || 'unknown'}" references binding to all interfaces (0.0.0.0), vulnerable to DNS rebinding.`,
        ],
        tags: ['dns-rebinding', 'network'],
        safeUseNotes: RECOMMENDATION,
      });
    }
  }

  return results;
}

const adapter = createRuleAdapter(scanDnsRebinding, RULE_ID, OWASP_ID, RECOMMENDATION);
export const analyzeTool = adapter.analyzeTool;
export const analyzePrompt = adapter.analyzePrompt;
export const analyzeResource = adapter.analyzeResource;
export const analyzePacket = adapter.analyzePacket;

export const ruleMetadata = {
  id: RULE_ID,
  name: 'DNS Rebinding Detection',
  owasp_id: OWASP_ID,
  severity: 'high',
  description: 'Detects servers bound to 0.0.0.0 vulnerable to DNS rebinding attacks.',
  source: 'static',
  type: 'network-security',
};
