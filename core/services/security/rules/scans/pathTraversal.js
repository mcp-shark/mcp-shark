/**
 * Path Traversal Detection
 * Detects MCP tools whose descriptions or parameters indicate
 * they accept file paths without sanitization, enabling ../../../ attacks.
 * Catalog reference: §1.5
 */
import { createRuleAdapter } from '../utils/adapter.js';
import { toolToText } from '../utils/text.js';

const RULE_ID = 'path-traversal';
const OWASP_ID = 'MCP05';
const RECOMMENDATION =
  'Validate and sanitize all file paths. Reject paths containing ".." or absolute paths outside allowed directories.';

const PATH_RISK_PATTERNS = [
  { pattern: /\.\.[/\\]/, label: 'literal path traversal (../)' },
  { pattern: /path[_\s]*traversal/i, label: 'path traversal mention' },
  { pattern: /any\s+file\s+path/i, label: 'unrestricted file path' },
  { pattern: /arbitrary\s+(file|path)/i, label: 'arbitrary file access' },
  { pattern: /absolute[_\s]*path/i, label: 'absolute path accepted' },
];

const PATH_PARAM_RISK = [
  { pattern: /^(file_?path|filepath|path|filename|file)$/i, label: 'file path parameter' },
];

export function scanPathTraversal(mcpData = {}) {
  const results = {
    toolFindings: [],
    resourceFindings: [],
    promptFindings: [],
    notablePatterns: [],
    recommendations: [RECOMMENDATION],
  };

  for (const tool of mcpData.tools || []) {
    const text = toolToText(tool);

    for (const { pattern, label } of PATH_RISK_PATTERNS) {
      if (pattern.test(text)) {
        results.toolFindings.push({
          issueType: 'Path Traversal Risk',
          name: tool?.name || 'tool',
          severity: 'high',
          reasons: [
            `Tool "${tool?.name || 'unknown'}" has ${label}, which may allow directory traversal attacks.`,
          ],
          tags: ['path-traversal', 'filesystem'],
          safeUseNotes: RECOMMENDATION,
        });
        break;
      }
    }

    const paramFindings = checkPathParameters(tool);
    results.toolFindings.push(...paramFindings);
  }

  return results;
}

/**
 * Check if tool has unsanitized path parameters
 */
function checkPathParameters(tool) {
  const schema = tool?.inputSchema || tool?.parameters || {};
  const properties = schema.properties || {};
  const findings = [];

  for (const [paramName, paramDef] of Object.entries(properties)) {
    const hasPathParam = PATH_PARAM_RISK.some((p) => p.pattern.test(paramName));
    if (!hasPathParam) {
      continue;
    }

    const desc = (paramDef.description || '').toLowerCase();
    const hasValidation =
      desc.includes('relative') || desc.includes('within') || desc.includes('allowed');
    if (!hasValidation) {
      findings.push({
        issueType: 'Unsanitized Path Parameter',
        name: tool?.name || 'tool',
        severity: 'medium',
        reasons: [
          `Tool "${tool?.name || 'unknown'}" has path parameter "${paramName}" without documented path validation.`,
        ],
        tags: ['path-traversal', 'input-validation'],
        safeUseNotes: RECOMMENDATION,
      });
    }
  }

  return findings;
}

const adapter = createRuleAdapter(scanPathTraversal, RULE_ID, OWASP_ID, RECOMMENDATION);
export const analyzeTool = adapter.analyzeTool;
export const analyzePrompt = adapter.analyzePrompt;
export const analyzeResource = adapter.analyzeResource;
export const analyzePacket = adapter.analyzePacket;

export const ruleMetadata = {
  id: RULE_ID,
  name: 'Path Traversal Detection',
  owasp_id: OWASP_ID,
  severity: 'high',
  description:
    'Detects tools that accept file paths without sanitization, enabling directory traversal.',
  source: 'static',
  type: 'general-security',
};
