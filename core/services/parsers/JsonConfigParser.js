/**
 * Parser for standard MCP JSON configuration format
 * Handles { mcpServers: { ... } } format (Cursor, Windsurf, etc.)
 */
export class JsonConfigParser {
  /**
   * Parse JSON content
   * @param {string} content - JSON file content
   * @returns {Object|null} Parsed config or null on error
   */
  parse(content) {
    try {
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
      return null;
    } catch (_error) {
      return null;
    }
  }

  /**
   * Check if config is in standard MCP JSON format
   * @param {Object} config - Parsed config object
   * @returns {boolean} True if config has mcpServers section
   */
  isMcpServersFormat(config) {
    return config && typeof config === 'object' && config.mcpServers !== undefined;
  }

  /**
   * Normalize standard MCP JSON format to internal format
   * Standard format: { mcpServers: { "server-name": { type?, command?, args?, env?, url?, headers? } } }
   * Internal format: Same structure, but ensures type is set
   * @param {Object} config - Parsed config
   * @returns {Object|null} Normalized config or null if invalid
   */
  normalizeToInternalFormat(config) {
    if (!this.isMcpServersFormat(config)) {
      return null;
    }

    const normalized = {
      mcpServers: {},
    };

    for (const [serverName, serverConfig] of Object.entries(config.mcpServers)) {
      if (!serverConfig || typeof serverConfig !== 'object') {
        continue;
      }

      const type = serverConfig.type || (serverConfig.url ? 'http' : 'stdio');
      normalized.mcpServers[serverName] = {
        type,
        ...serverConfig,
      };
    }

    if (Object.keys(normalized.mcpServers).length === 0) {
      return null;
    }

    return normalized;
  }
}
