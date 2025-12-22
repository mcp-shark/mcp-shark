import * as fs from 'node:fs';
import { homedir } from 'node:os';
import * as path from 'node:path';
import { getMcpConfigPath } from '#common/configs';

/**
 * Service for configuration file operations
 * Handles reading, parsing, and managing MCP configuration files
 */
export class ConfigService {
  constructor(logger) {
    this.logger = logger;
    this.originalConfigData = null;
  }

  /**
   * Resolve file path (expand ~ to home directory)
   */
  resolveFilePath(filePath) {
    if (!filePath) {
      return null;
    }
    return filePath.startsWith('~') ? path.join(homedir(), filePath.slice(1)) : filePath;
  }

  /**
   * Read file content from path or use provided content
   */
  resolveFileData(filePath, fileContent) {
    if (fileContent) {
      const resolvedFilePath = filePath ? this.resolveFilePath(filePath) : null;
      return { content: fileContent, resolvedFilePath };
    }

    if (!filePath) {
      return null;
    }

    const resolvedFilePath = this.resolveFilePath(filePath);

    if (!fs.existsSync(resolvedFilePath)) {
      return null;
    }

    return {
      content: fs.readFileSync(resolvedFilePath, 'utf-8'),
      resolvedFilePath,
    };
  }

  /**
   * Parse JSON content safely
   */
  parseJsonConfig(content) {
    try {
      return { config: JSON.parse(content), error: null };
    } catch (error) {
      return { config: null, error };
    }
  }

  /**
   * Try to parse JSON, return null on error
   */
  tryParseJson(content) {
    try {
      return JSON.parse(content);
    } catch (_e) {
      return null;
    }
  }

  /**
   * Read config file content
   */
  readConfigFile(filePath) {
    const resolvedPath = this.resolveFilePath(filePath);

    if (!fs.existsSync(resolvedPath)) {
      return null;
    }

    return fs.readFileSync(resolvedPath, 'utf-8');
  }

  /**
   * Write config file
   */
  writeConfigFile(filePath, content) {
    const resolvedPath = this.resolveFilePath(filePath);
    fs.writeFileSync(resolvedPath, content);
    this.logger?.info({ path: resolvedPath }, 'Wrote config file');
  }

  /**
   * Check if file exists
   */
  fileExists(filePath) {
    const resolvedPath = this.resolveFilePath(filePath);
    return fs.existsSync(resolvedPath);
  }

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
   * Detect config files on the system
   */
  detectConfigFiles() {
    const detected = [];
    const platform = process.platform;
    const homeDir = homedir();

    const cursorPaths = [
      path.join(homeDir, '.cursor', 'mcp.json'),
      ...(platform === 'win32'
        ? [path.join(process.env.USERPROFILE || '', '.cursor', 'mcp.json')]
        : []),
    ];

    const windsurfPaths = [
      path.join(homeDir, '.codeium', 'windsurf', 'mcp_config.json'),
      ...(platform === 'win32'
        ? [path.join(process.env.USERPROFILE || '', '.codeium', 'windsurf', 'mcp_config.json')]
        : []),
    ];

    for (const cursorPath of cursorPaths) {
      if (fs.existsSync(cursorPath)) {
        detected.push({
          editor: 'Cursor',
          path: cursorPath,
          displayPath: cursorPath.replace(homeDir, '~'),
          exists: true,
        });
        break;
      }
    }

    for (const windsurfPath of windsurfPaths) {
      if (fs.existsSync(windsurfPath)) {
        detected.push({
          editor: 'Windsurf',
          path: windsurfPath,
          displayPath: windsurfPath.replace(homeDir, '~'),
          exists: true,
        });
        break;
      }
    }

    const defaultPaths = [
      {
        editor: 'Cursor',
        path: path.join(homeDir, '.cursor', 'mcp.json'),
        displayPath: '~/.cursor/mcp.json',
        exists: fs.existsSync(path.join(homeDir, '.cursor', 'mcp.json')),
      },
      {
        editor: 'Windsurf',
        path: path.join(homeDir, '.codeium', 'windsurf', 'mcp_config.json'),
        displayPath: '~/.codeium/windsurf/mcp_config.json',
        exists: fs.existsSync(path.join(homeDir, '.codeium', 'windsurf', 'mcp_config.json')),
      },
    ];

    return detected.length > 0 ? detected : defaultPaths;
  }

  /**
   * Get MCP config path
   */
  getMcpConfigPath() {
    return getMcpConfigPath();
  }

  /**
   * Read MCP config file
   */
  readMcpConfig() {
    const configPath = this.getMcpConfigPath();
    if (!fs.existsSync(configPath)) {
      return null;
    }

    const content = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Get servers from MCP config
   */
  getServersFromConfig() {
    const config = this.readMcpConfig();
    if (!config) {
      return [];
    }

    return config.servers ? Object.keys(config.servers) : [];
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

  /**
   * Store original config for restoration
   */
  storeOriginalConfig(filePath, originalContent, backupPath) {
    this.originalConfigData = { filePath, originalContent, backupPath };
  }

  /**
   * Restore original config
   */
  restoreOriginalConfig() {
    if (this.originalConfigData?.filePath) {
      try {
        if (fs.existsSync(this.originalConfigData.filePath)) {
          fs.writeFileSync(
            this.originalConfigData.filePath,
            this.originalConfigData.originalContent
          );
          this.logger?.info({ path: this.originalConfigData.filePath }, 'Restored original config');
          this.originalConfigData = null;
          return true;
        }
        this.originalConfigData = null;
        return false;
      } catch (error) {
        this.logger?.error({ error: error.message }, 'Failed to restore original config');
        this.originalConfigData = null;
        return false;
      }
    }
    return false;
  }

  /**
   * Clear original config reference
   */
  clearOriginalConfig() {
    this.originalConfigData = null;
  }
}
