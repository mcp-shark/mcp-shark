/**
 * Unsafe Default Configuration Detection
 * Detects MCP servers running with insecure default settings
 * such as debug mode, verbose logging of secrets, or disabled auth.
 */
import { createRuleAdapter } from '../utils/adapter.js';
import { toolToText } from '../utils/text.js';

const RULE_ID = 'unsafe-defaults';
const OWASP_ID = 'MCP07';
const RECOMMENDATION =
  'Disable debug mode and verbose logging in production. Enable authentication on all server endpoints.';

const UNSAFE_DEFAULT_PATTERNS = [
  { pattern: /debug[=:]\s*true/i, label: 'debug mode enabled' },
  { pattern: /--debug\b/i, label: 'debug flag' },
  { pattern: /NODE_ENV[=:]\s*development/i, label: 'NODE_ENV=development' },
  { pattern: /verbose[=:]\s*true/i, label: 'verbose logging enabled' },
  { pattern: /log[_-]?level[=:]\s*(debug|trace)/i, label: 'debug-level logging' },
  { pattern: /auth[=:]\s*false/i, label: 'authentication disabled' },
  { pattern: /--no-auth\b/i, label: 'no-auth flag' },
  { pattern: /disable[_-]?auth/i, label: 'auth disabled' },
  { pattern: /tls[=:]\s*false/i, label: 'TLS disabled' },
  { pattern: /--insecure\b/i, label: 'insecure flag' },
];

export function scanUnsafeDefaults(mcpData = {}) {
  const results = {
    toolFindings: [],
    resourceFindings: [],
    promptFindings: [],
    notablePatterns: [],
    recommendations: [RECOMMENDATION],
  };

  for (const tool of mcpData.tools || []) {
    const text = toolToText(tool);
    for (const { pattern, label } of UNSAFE_DEFAULT_PATTERNS) {
      if (pattern.test(text)) {
        results.toolFindings.push({
          issueType: 'Unsafe Default Configuration',
          name: tool?.name || 'tool',
          severity: 'medium',
          reasons: [
            `Tool "${tool?.name || 'unknown'}" has ${label} — this is insecure for production use.`,
          ],
          tags: ['defaults', 'configuration'],
          safeUseNotes: RECOMMENDATION,
        });
        break;
      }
    }
  }

  return results;
}

/**
 * Analyze a server config for unsafe defaults
 * Called directly by ScanService
 */
export function analyzeServerDefaults(serverName, config) {
  const text = JSON.stringify(config || {});
  const findings = [];

  for (const { pattern, label } of UNSAFE_DEFAULT_PATTERNS) {
    if (pattern.test(text)) {
      findings.push({
        rule_id: RULE_ID,
        severity: 'medium',
        owasp_id: OWASP_ID,
        title: `Unsafe default: ${label} on ${serverName}`,
        description: `${serverName} has ${label}. This may expose sensitive data or weaken security.`,
        recommendation: RECOMMENDATION,
        server_name: serverName,
        confidence: 'probable',
      });
    }
  }

  return findings;
}

const adapter = createRuleAdapter(scanUnsafeDefaults, RULE_ID, OWASP_ID, RECOMMENDATION);
export const analyzeTool = adapter.analyzeTool;
export const analyzePrompt = adapter.analyzePrompt;
export const analyzeResource = adapter.analyzeResource;
export const analyzePacket = adapter.analyzePacket;

export const ruleMetadata = {
  id: RULE_ID,
  name: 'Unsafe Default Configuration',
  owasp_id: OWASP_ID,
  severity: 'medium',
  description:
    'Detects servers running with insecure default settings like debug mode or disabled auth.',
  source: 'static',
  type: 'general-security',
};
