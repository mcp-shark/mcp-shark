/**
 * Service for configuration transformations
 * Handles converting, filtering, and updating config structures
 */
export class ConfigTransformService {
  constructor(configParserFactory) {
    this.parserFactory = configParserFactory;
  }

  /**
   * Convert MCP servers format to servers format
   * Normalizes config first, then converts mcpServers to servers
   */
  convertMcpServersToServers(config) {
    // Normalize config to ensure consistent format
    const normalized = this.parserFactory.normalizeToInternalFormat(config);
    if (!normalized) {
      return { servers: {} };
    }

    const converted = { servers: {} };

    // Handle normalized servers (legacy format)
    if (normalized.servers) {
      converted.servers = { ...normalized.servers };
    }

    // Convert mcpServers to servers format
    if (normalized.mcpServers) {
      for (const [name, cfg] of Object.entries(normalized.mcpServers)) {
        const type = cfg.type || (cfg.url ? 'http' : cfg.command ? 'stdio' : 'stdio');
        converted.servers[name] = { type, ...cfg };
      }
    }

    return converted;
  }

  /**
   * Extract services from config
   */
  extractServices(config) {
    const { mcpServers, servers } = config;
    const servicesMap = new Map();

    if (servers) {
      for (const [name, cfg] of Object.entries(servers)) {
        const type = cfg.type || (cfg.url ? 'http' : cfg.command ? 'stdio' : 'stdio');
        servicesMap.set(name, {
          name,
          type,
          url: cfg.url || null,
          command: cfg.command || null,
          args: cfg.args || null,
        });
      }
    }

    if (mcpServers) {
      for (const [name, cfg] of Object.entries(mcpServers)) {
        if (!servicesMap.has(name)) {
          const type = cfg.type || (cfg.url ? 'http' : cfg.command ? 'stdio' : 'stdio');
          servicesMap.set(name, {
            name,
            type,
            url: cfg.url || null,
            command: cfg.command || null,
            args: cfg.args || null,
          });
        }
      }
    }

    return Array.from(servicesMap.values());
  }

  /**
   * Filter servers from config by selected service names
   */
  filterServers(config, selectedServices) {
    if (!selectedServices || !Array.isArray(selectedServices) || selectedServices.length === 0) {
      return config;
    }

    const filtered = { servers: {} };
    for (const serviceName of selectedServices) {
      if (config.servers?.[serviceName]) {
        filtered.servers[serviceName] = config.servers[serviceName];
      }
    }

    return filtered;
  }

  /**
   * Update config to use MCP Shark HTTP endpoints
   */
  updateConfigForMcpShark(originalConfig) {
    const [serverObject, serverType] = this._getServerObject(originalConfig);
    const updatedConfig = { ...originalConfig };

    if (serverObject) {
      const updatedServers = {};
      for (const [name, _cfg] of Object.entries(serverObject)) {
        updatedServers[name] = {
          type: 'http',
          url: `http://localhost:9851/mcp/${encodeURIComponent(name)}`,
        };
      }
      updatedConfig[serverType] = updatedServers;
    }

    return updatedConfig;
  }

  /**
   * Get selected service names from config
   */
  getSelectedServiceNames(originalConfig, selectedServices) {
    if (selectedServices && Array.isArray(selectedServices) && selectedServices.length > 0) {
      return new Set(selectedServices);
    }

    const selectedServiceNames = new Set();
    const hasMcpServers =
      originalConfig.mcpServers && typeof originalConfig.mcpServers === 'object';
    const hasServers = originalConfig.servers && typeof originalConfig.servers === 'object';

    if (hasMcpServers) {
      for (const name of Object.keys(originalConfig.mcpServers)) {
        selectedServiceNames.add(name);
      }
    } else if (hasServers) {
      for (const name of Object.keys(originalConfig.servers)) {
        selectedServiceNames.add(name);
      }
    }

    return selectedServiceNames;
  }

  _getServerObject(originalConfig) {
    const hasMcpServers =
      originalConfig.mcpServers && typeof originalConfig.mcpServers === 'object';
    const hasServers = originalConfig.servers && typeof originalConfig.servers === 'object';

    if (hasMcpServers) {
      return [originalConfig.mcpServers, 'mcpServers'];
    }

    if (hasServers) {
      return [originalConfig.servers, 'servers'];
    }

    return [null, null];
  }
}
