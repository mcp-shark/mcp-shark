import { parse as parseToml } from '@iarna/toml';

/**
 * Parser for TOML configuration files (Codex format)
 * Handles [mcp_servers] section with underscore notation
 */
export class TomlConfigParser {
  /**
   * Parse TOML content
   * @param {string} content - TOML file content
   * @returns {Object|null} Parsed config or null on error
   */
  parse(content) {
    try {
      const parsed = parseToml(content);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
      return null;
    } catch (_error) {
      return null;
    }
  }

  /**
   * Check if config is in TOML format (Codex format)
   * @param {Object} config - Parsed config object
   * @returns {boolean} True if config has mcp_servers section
   */
  isCodexFormat(config) {
    return config && typeof config === 'object' && config.mcp_servers !== undefined;
  }

  /**
   * Convert Codex TOML format to MCP Shark internal format
   * Codex format: [mcp_servers."server-name"] with command, args, env, url
   * Internal format: { mcpServers: { "server-name": { type, command, args, env, url, headers } } }
   * @param {Object} codexConfig - Parsed Codex config
   * @returns {Object|null} Converted config or null if invalid
   */
  convertToMcpSharkFormat(codexConfig) {
    if (!this.isCodexFormat(codexConfig)) {
      return null;
    }

    const mcpServers = {};

    for (const [serverName, serverConfig] of Object.entries(codexConfig.mcp_servers)) {
      if (!serverConfig || typeof serverConfig !== 'object') {
        continue;
      }

      const converted = {
        type: serverConfig.url ? 'http' : 'stdio',
      };

      if (serverConfig.command) {
        converted.command = serverConfig.command;
      }

      if (Array.isArray(serverConfig.args)) {
        converted.args = serverConfig.args;
      }

      if (serverConfig.env && typeof serverConfig.env === 'object') {
        converted.env = serverConfig.env;
      }

      if (serverConfig.url) {
        converted.url = serverConfig.url;
        if (serverConfig.headers && typeof serverConfig.headers === 'object') {
          converted.headers = serverConfig.headers;
        }
      }

      mcpServers[serverName] = converted;
    }

    if (Object.keys(mcpServers).length === 0) {
      return null;
    }

    return {
      mcpServers,
    };
  }
}
