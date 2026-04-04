/**
 * ANSI Escape Sequence Detection
 * Detects ANSI escape codes in tool descriptions that could be used
 * to hide malicious instructions or create visual confusion.
 * Catalog reference: §1.8 (terminal injection)
 */
import { createRuleAdapter } from '../utils/adapter.js';

const RULE_ID = 'ansi-escape-sequences';
const OWASP_ID = 'MCP03';
const RECOMMENDATION =
  'Strip ANSI escape sequences from tool descriptions. Run: npx mcp-shark scan --fix';

const ESC = String.fromCharCode(0x1b);
const ANSI_REGEX = new RegExp(`${ESC}\\[[0-9;]*[a-zA-Z]`);
const CURSOR_MOVE_REGEX = new RegExp(`${ESC}\\[\\d*[ABCDHJ]`);

function scanForAnsi(text) {
  if (!text || typeof text !== 'string') {
    return null;
  }
  if (ANSI_REGEX.test(text)) {
    return {
      hasCursorMove: CURSOR_MOVE_REGEX.test(text),
    };
  }
  return null;
}

export function scanAnsiEscapeSequences(mcpData = {}) {
  const results = {
    toolFindings: [],
    resourceFindings: [],
    promptFindings: [],
    notablePatterns: [],
    recommendations: [RECOMMENDATION],
  };

  for (const tool of mcpData.tools || []) {
    const desc = tool?.description || '';
    const hit = scanForAnsi(desc);
    if (hit) {
      const severity = hit.hasCursorMove ? 'high' : 'medium';
      results.toolFindings.push({
        issueType: 'ANSI Escape Sequences',
        name: tool?.name || 'tool',
        severity,
        reasons: [
          `Tool "${tool?.name || 'unknown'}" description contains ANSI escape sequences${hit.hasCursorMove ? ' including cursor movement (potential terminal injection).' : '.'}`,
        ],
        tags: ['ansi', 'terminal-injection'],
        safeUseNotes: RECOMMENDATION,
      });
    }
  }

  return results;
}

const adapter = createRuleAdapter(scanAnsiEscapeSequences, RULE_ID, OWASP_ID, RECOMMENDATION);
export const analyzeTool = adapter.analyzeTool;
export const analyzePrompt = adapter.analyzePrompt;
export const analyzeResource = adapter.analyzeResource;
export const analyzePacket = adapter.analyzePacket;

export const ruleMetadata = {
  id: RULE_ID,
  name: 'ANSI Escape Sequence Detection',
  owasp_id: OWASP_ID,
  severity: 'medium',
  description: 'Detects ANSI escape codes in tool descriptions that could hide malicious content.',
  source: 'static',
  type: 'general-security',
};
