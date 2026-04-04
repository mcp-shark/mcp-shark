/**
 * Sensitive Data Exposure Detection
 * Detects MCP tools that may return sensitive data (PII, secrets, credentials)
 * in their responses without redaction.
 * Catalog reference: §1.1, §1.8
 */
import { createRuleAdapter } from '../utils/adapter.js';
import { toolToText } from '../utils/text.js';

const RULE_ID = 'sensitive-data-exposure';
const OWASP_ID = 'MCP08';
const RECOMMENDATION =
  'Tools that access sensitive data should redact PII, credentials, and secrets from responses. Apply output filtering.';

const SENSITIVE_DATA_PATTERNS = [
  { pattern: /password/i, label: 'password field' },
  { pattern: /credit[_\s]?card/i, label: 'credit card data' },
  { pattern: /social[_\s]?security/i, label: 'social security number' },
  { pattern: /ssn\b/i, label: 'SSN field' },
  { pattern: /private[_\s]?key/i, label: 'private key' },
  { pattern: /secret[_\s]?key/i, label: 'secret key' },
  { pattern: /bearer[_\s]?token/i, label: 'bearer token' },
  { pattern: /access[_\s]?token/i, label: 'access token' },
  { pattern: /refresh[_\s]?token/i, label: 'refresh token' },
  { pattern: /database[_\s]?url/i, label: 'database URL' },
  { pattern: /connection[_\s]?string/i, label: 'connection string' },
];

const REDACTION_INDICATORS = [
  /redact/i,
  /mask/i,
  /filter/i,
  /sanitize/i,
  /censor/i,
  /strip/i,
  /scrub/i,
];

export function scanSensitiveDataExposure(mcpData = {}) {
  const results = {
    toolFindings: [],
    resourceFindings: [],
    promptFindings: [],
    notablePatterns: [],
    recommendations: [RECOMMENDATION],
  };

  for (const tool of mcpData.tools || []) {
    const text = toolToText(tool);
    const hasRedaction = REDACTION_INDICATORS.some((p) => p.test(text));
    if (hasRedaction) {
      continue;
    }

    for (const { pattern, label } of SENSITIVE_DATA_PATTERNS) {
      if (pattern.test(text)) {
        results.toolFindings.push({
          issueType: 'Sensitive Data Exposure',
          name: tool?.name || 'tool',
          severity: 'high',
          reasons: [
            `Tool "${tool?.name || 'unknown'}" handles ${label} without documented redaction.`,
          ],
          tags: ['data-exposure', 'pii'],
          safeUseNotes: RECOMMENDATION,
        });
        break;
      }
    }
  }

  return results;
}

const adapter = createRuleAdapter(scanSensitiveDataExposure, RULE_ID, OWASP_ID, RECOMMENDATION);
export const analyzeTool = adapter.analyzeTool;
export const analyzePrompt = adapter.analyzePrompt;
export const analyzeResource = adapter.analyzeResource;
export const analyzePacket = adapter.analyzePacket;

export const ruleMetadata = {
  id: RULE_ID,
  name: 'Sensitive Data Exposure',
  owasp_id: OWASP_ID,
  severity: 'high',
  description: 'Detects tools that may expose PII, credentials, or secrets without redaction.',
  source: 'static',
  type: 'general-security',
};
