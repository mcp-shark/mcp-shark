/**
 * Parser for legacy MCP JSON configuration format
 * Handles { servers: { ... } } format (old format)
 */
export class LegacyJsonConfigParser {
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
   * Check if config is in legacy format
   * @param {Object} config - Parsed config object
   * @returns {boolean} True if config has servers section (but not mcpServers)
   */
  isLegacyFormat(config) {
    return (
      config &&
      typeof config === 'object' &&
      config.servers !== undefined &&
      config.mcpServers === undefined
    );
  }

  /**
   * Convert legacy format to internal format
   * Legacy format: { servers: { "server-name": { type, command?, args?, env?, url?, headers? } } }
   * Internal format: { servers: { "server-name": { type, ... } } }
   * @param {Object} config - Parsed legacy config
   * @returns {Object|null} Converted config or null if invalid
   */
  convertToInternalFormat(config) {
    if (!this.isLegacyFormat(config)) {
      return null;
    }

    const converted = {
      servers: {},
    };

    for (const [serverName, serverConfig] of Object.entries(config.servers)) {
      if (!serverConfig || typeof serverConfig !== 'object') {
        continue;
      }

      const type = serverConfig.type || 'stdio';
      converted.servers[serverName] = {
        type,
        ...serverConfig,
      };
    }

    if (Object.keys(converted.servers).length === 0) {
      return null;
    }

    return converted;
  }
}
