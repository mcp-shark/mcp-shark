/**
 * Missing Directory Containment Detection
 * Detects filesystem-type MCP servers without directory restrictions,
 * granting full filesystem access to the agent.
 * Catalog reference: §1.1 (unrestricted file access)
 */
import { createRuleAdapter } from '../utils/adapter.js';
import { toolToText } from '../utils/text.js';

const RULE_ID = 'missing-containment';
const OWASP_ID = 'MCP10';
const RECOMMENDATION =
  'Restrict filesystem servers to specific directories using allowlist args (e.g., --allow-dir /path/to/project).';

const FS_SERVER_PATTERNS = [
  /filesystem/i,
  /file.?system/i,
  /fs.?server/i,
  /read_file|write_file|list_directory/i,
];

const CONTAINMENT_INDICATORS = [
  /--allow/i,
  /--root/i,
  /--dir/i,
  /--sandbox/i,
  /allowedDirectories/i,
  /rootPath/i,
  /basePath/i,
];

function isFilesystemServer(serverName, config) {
  const text = `${serverName} ${JSON.stringify(config || {})}`;
  for (const pattern of FS_SERVER_PATTERNS) {
    if (pattern.test(text)) {
      return true;
    }
  }
  return false;
}

function hasContainment(config) {
  const text = JSON.stringify(config || {});
  for (const pattern of CONTAINMENT_INDICATORS) {
    if (pattern.test(text)) {
      return true;
    }
  }
  return false;
}

export function scanMissingContainment(mcpData = {}) {
  const results = {
    toolFindings: [],
    resourceFindings: [],
    promptFindings: [],
    notablePatterns: [],
    recommendations: [RECOMMENDATION],
  };

  for (const tool of mcpData.tools || []) {
    const text = toolToText(tool);
    const hasFilesystem = FS_SERVER_PATTERNS.some((p) => p.test(text));
    if (hasFilesystem) {
      const contained = CONTAINMENT_INDICATORS.some((p) => p.test(text));
      if (!contained) {
        results.toolFindings.push({
          issueType: 'Missing Directory Containment',
          name: tool?.name || 'tool',
          severity: 'medium',
          reasons: [
            `Tool "${tool?.name || 'unknown'}" has filesystem access without directory containment.`,
          ],
          tags: ['containment', 'filesystem'],
          safeUseNotes: RECOMMENDATION,
        });
      }
    }
  }

  return results;
}

/**
 * Analyze a server config for missing containment
 * Called directly by ScanService
 */
export function analyzeServerContainment(serverName, config) {
  if (!isFilesystemServer(serverName, config)) {
    return [];
  }
  if (hasContainment(config)) {
    return [];
  }

  return [
    {
      rule_id: RULE_ID,
      severity: 'medium',
      owasp_id: OWASP_ID,
      title: `No directory containment on ${serverName}`,
      description: `${serverName} has filesystem access without directory restrictions. The agent can read/write any file.`,
      recommendation: RECOMMENDATION,
      server_name: serverName,
      confidence: 'possible',
    },
  ];
}

const adapter = createRuleAdapter(scanMissingContainment, RULE_ID, OWASP_ID, RECOMMENDATION);
export const analyzeTool = adapter.analyzeTool;
export const analyzePrompt = adapter.analyzePrompt;
export const analyzeResource = adapter.analyzeResource;
export const analyzePacket = adapter.analyzePacket;

export const ruleMetadata = {
  id: RULE_ID,
  name: 'Missing Directory Containment',
  owasp_id: OWASP_ID,
  severity: 'medium',
  description: 'Detects filesystem servers without directory restrictions.',
  source: 'static',
  type: 'general-security',
};
