/**
 * Tool Classification Database
 * Maps known MCP server tools to their capability categories.
 *
 * Built-in classifications loaded from data/tool-classifications.json.
 * User overrides merged from .mcp-shark/classifications.yaml.
 *
 * Categories:
 *   ingests_untrusted - reads external/public data
 *   writes_code       - modifies source code, pushes commits
 *   sends_external    - sends data to external endpoints
 *   reads_secrets     - accesses sensitive local data
 *   modifies_infra    - changes infrastructure state
 */
import { loadBuiltinJson, loadUserYamlMap } from './DataLoader.js';

const BUILTIN = loadBuiltinJson('tool-classifications.json');
const USER_OVERRIDES = loadUserYamlMap('classifications.yaml');

export const TOOL_CLASSIFICATIONS = mergeClassifications(BUILTIN, USER_OVERRIDES);

/**
 * Deep-merge user overrides into built-in classifications.
 * User entries for existing servers extend (not replace) the tool map.
 * New servers are added wholesale.
 */
function mergeClassifications(builtin, overrides) {
  const merged = { ...builtin };
  for (const [server, tools] of Object.entries(overrides)) {
    if (merged[server]) {
      merged[server] = { ...merged[server], ...tools };
    } else {
      merged[server] = { ...tools };
    }
  }
  return merged;
}
