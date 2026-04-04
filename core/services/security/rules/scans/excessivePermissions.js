/**
 * Excessive Permissions Detection
 * Detects MCP servers that request overly broad permissions
 * such as wildcard scopes, admin access, or unrestricted capabilities.
 * Catalog reference: §1.2
 */
import { createRuleAdapter } from '../utils/adapter.js';
import { toolToText } from '../utils/text.js';

const RULE_ID = 'excessive-permissions';
const OWASP_ID = 'MCP02';
const RECOMMENDATION =
  'Apply the principle of least privilege. Restrict server permissions to only what is needed for its function.';

const EXCESSIVE_PATTERNS = [
  { pattern: /\*:\*/, label: 'wildcard scope (*:*)' },
  { pattern: /admin[_:]?access/i, label: 'admin access' },
  { pattern: /full[_-]?access/i, label: 'full access' },
  { pattern: /root[_:]?access/i, label: 'root access' },
  { pattern: /sudo\s/i, label: 'sudo usage' },
  { pattern: /--privileged/i, label: 'privileged flag' },
  { pattern: /--no-sandbox/i, label: 'no-sandbox flag' },
  { pattern: /chmod\s+777/i, label: 'chmod 777' },
  { pattern: /allowAll|allow_all/i, label: 'allow-all policy' },
  { pattern: /unrestricted/i, label: 'unrestricted mode' },
];

export function scanExcessivePermissions(mcpData = {}) {
  const results = {
    toolFindings: [],
    resourceFindings: [],
    promptFindings: [],
    notablePatterns: [],
    recommendations: [RECOMMENDATION],
  };

  for (const tool of mcpData.tools || []) {
    const text = toolToText(tool);
    for (const { pattern, label } of EXCESSIVE_PATTERNS) {
      if (pattern.test(text)) {
        results.toolFindings.push({
          issueType: 'Excessive Permissions',
          name: tool?.name || 'tool',
          severity: 'high',
          reasons: [
            `Tool "${tool?.name || 'unknown'}" uses ${label}, which grants overly broad access.`,
          ],
          tags: ['permissions', 'scope-creep'],
          safeUseNotes: RECOMMENDATION,
        });
        break;
      }
    }
  }

  return results;
}

const adapter = createRuleAdapter(scanExcessivePermissions, RULE_ID, OWASP_ID, RECOMMENDATION);
export const analyzeTool = adapter.analyzeTool;
export const analyzePrompt = adapter.analyzePrompt;
export const analyzeResource = adapter.analyzeResource;
export const analyzePacket = adapter.analyzePacket;

export const ruleMetadata = {
  id: RULE_ID,
  name: 'Excessive Permissions',
  owasp_id: OWASP_ID,
  severity: 'high',
  description: 'Detects servers or tools with overly broad permission scopes.',
  source: 'static',
  type: 'general-security',
};
