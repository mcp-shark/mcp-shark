/**
 * Scans IDE config files and extracts MCP server definitions
 * Supports JSON, TOML, and embedded JSON (settings files with mcpServers key)
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { basename } from 'node:path';
import TOML from '@iarna/toml';
import { IDE_CONFIGS } from './IdeConfigPaths.js';

/**
 * Parse a JSON config file for MCP servers
 * @returns {{ servers: object, raw: object } | null}
 */
function parseJsonConfig(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(content);
    const servers = parsed.mcpServers || parsed.servers || {};
    return { servers, raw: parsed };
  } catch (_err) {
    return null;
  }
}

/**
 * Parse a TOML config file (Codex) for MCP servers
 * @returns {{ servers: object, raw: object } | null}
 */
function parseTOMLConfig(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const parsed = TOML.parse(content);
    const servers = parsed.mcpServers || parsed.mcp_servers || {};
    return { servers, raw: parsed };
  } catch (_err) {
    return null;
  }
}

/**
 * Parse a JSON settings file that embeds MCP config under a key
 * (Gemini CLI, Continue, Zed)
 * @returns {{ servers: object, raw: object } | null}
 */
function parseEmbeddedJsonConfig(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(content);
    const servers = parsed.mcpServers || parsed.mcp_servers || parsed.mcp?.servers || {};
    return { servers, raw: parsed };
  } catch (_err) {
    return null;
  }
}

/**
 * Get file permissions as octal string (Unix only)
 */
function getFilePermissions(filePath) {
  try {
    const stats = statSync(filePath);
    return (stats.mode & 0o777).toString(8);
  } catch (_err) {
    return null;
  }
}

/**
 * Extract tool definitions from a server config entry
 */
function extractToolsFromServer(serverConfig) {
  if (serverConfig.tools) {
    return serverConfig.tools;
  }
  return [];
}

/**
 * Scan all IDEs and return discovered MCP configurations
 * @param {object} options
 * @param {string} [options.ide] - Filter to specific IDE name
 * @returns {Array<object>} Array of discovered IDE configs with servers
 */
export function scanIdeConfigs(options = {}) {
  const results = [];
  const ideFilter = options.ide ? options.ide.toLowerCase() : null;

  for (const ideConfig of IDE_CONFIGS) {
    if (ideFilter && ideConfig.name.toLowerCase() !== ideFilter) {
      continue;
    }

    const detected = detectIdeConfig(ideConfig);
    results.push(detected);
  }

  return results;
}

/**
 * Detect and parse a single IDE config
 */
function detectIdeConfig(ideConfig) {
  const result = {
    name: ideConfig.name,
    found: false,
    configPath: null,
    displayPath: null,
    permissions: null,
    servers: {},
    serverCount: 0,
    toolCount: 0,
    error: null,
  };

  for (const configPath of ideConfig.paths) {
    if (!existsSync(configPath)) {
      continue;
    }

    result.found = true;
    result.configPath = configPath;
    result.displayPath = configPath.replace(process.env.HOME || '', '~');
    result.permissions = getFilePermissions(configPath);

    const parsed = parseConfigByType(ideConfig.parser, configPath);
    if (!parsed) {
      result.error = `Failed to parse ${basename(configPath)}`;
      break;
    }

    result.servers = parsed.servers;
    result.serverCount = Object.keys(parsed.servers).length;

    const toolCount = countTools(parsed.servers);
    result.toolCount = toolCount;
    break;
  }

  return result;
}

/**
 * Route to the correct parser based on config type
 */
function parseConfigByType(parser, filePath) {
  if (parser === 'json') {
    return parseJsonConfig(filePath);
  }
  if (parser === 'toml') {
    return parseTOMLConfig(filePath);
  }
  if (parser === 'jsonEmbedded') {
    return parseEmbeddedJsonConfig(filePath);
  }
  return null;
}

/**
 * Count total tools across all servers
 */
function countTools(servers) {
  const total = Object.values(servers).reduce((sum, server) => {
    const tools = extractToolsFromServer(server);
    return sum + (Array.isArray(tools) ? tools.length : Object.keys(tools).length);
  }, 0);
  return total;
}

/**
 * Get a flat list of all servers across all IDEs
 */
export function getAllServers(ideResults) {
  const servers = [];
  for (const ide of ideResults) {
    if (!ide.found) {
      continue;
    }
    for (const [serverName, serverConfig] of Object.entries(ide.servers)) {
      servers.push({
        name: serverName,
        ide: ide.name,
        configPath: ide.configPath,
        config: serverConfig,
        tools: extractToolsFromServer(serverConfig),
      });
    }
  }
  return servers;
}
