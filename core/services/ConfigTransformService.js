/**
 * Service for configuration transformations
 * Handles converting, filtering, and updating config structures
 */
export class ConfigTransformService {
  /**
   * Convert MCP servers format to servers format
   */
  convertMcpServersToServers(config) {
    const { mcpServers, servers } = config;
    const converted = { servers: {} };

    if (servers) {
      converted.servers = servers;
    }

    if (mcpServers) {
      Object.entries(mcpServers).forEach(([name, cfg]) => {
        const type = cfg.type || (cfg.url ? 'http' : cfg.command ? 'stdio' : 'stdio');
        converted.servers[name] = { type, ...cfg };
      });
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
      Object.entries(servers).forEach(([name, cfg]) => {
        const type = cfg.type || (cfg.url ? 'http' : cfg.command ? 'stdio' : 'stdio');
        servicesMap.set(name, {
          name,
          type,
          url: cfg.url || null,
          command: cfg.command || null,
          args: cfg.args || null,
        });
      });
    }

    if (mcpServers) {
      Object.entries(mcpServers).forEach(([name, cfg]) => {
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
      });
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
    selectedServices.forEach((serviceName) => {
      if (config.servers?.[serviceName]) {
        filtered.servers[serviceName] = config.servers[serviceName];
      }
    });

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
      Object.entries(serverObject).forEach(([name, _cfg]) => {
        updatedServers[name] = {
          type: 'http',
          url: `http://localhost:9851/mcp/${encodeURIComponent(name)}`,
        };
      });
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
      Object.keys(originalConfig.mcpServers).forEach((name) => selectedServiceNames.add(name));
    } else if (hasServers) {
      Object.keys(originalConfig.servers).forEach((name) => selectedServiceNames.add(name));
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
