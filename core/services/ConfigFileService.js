import * as fs from 'node:fs';
import { homedir } from 'node:os';
import * as path from 'node:path';
import { getMcpConfigPath } from '#core/configs/index.js';

/**
 * Service for configuration file operations
 * Handles file I/O, path resolution, and backup/restore
 */
export class ConfigFileService {
  constructor(logger, configDetectionService, configParserFactory) {
    this.logger = logger;
    this.originalConfigData = null;
    this.detectionService = configDetectionService;
    this.parserFactory = configParserFactory;
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
   * Parse JSON or TOML content safely using appropriate parser
   */
  parseJsonConfig(content, filePath = null) {
    try {
      const config = this.parserFactory.parse(content, filePath);
      return { config, error: null };
    } catch (error) {
      return { config: null, error };
    }
  }

  /**
   * Try to parse JSON or TOML, return null on error
   */
  tryParseJson(content, filePath = null) {
    return this.parserFactory.parse(content, filePath);
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
   * Get file type from path
   */
  getFileType(filePath) {
    if (!filePath) {
      return 'JSON';
    }
    const ext = path.extname(filePath).toLowerCase();
    return ext === '.toml' ? 'TOML' : 'JSON';
  }

  /**
   * Get display path (replace home directory with ~)
   */
  getDisplayPath(filePath) {
    if (!filePath) {
      return filePath;
    }
    const homeDir = homedir();
    return filePath.replace(homeDir, '~');
  }

  /**
   * Get home directory
   */
  getHomeDir() {
    return homedir();
  }

  /**
   * Detect config files on the system
   */
  detectConfigFiles() {
    return this.detectionService.detectConfigFiles();
  }

  /**
   * Get MCP config path
   */
  getMcpConfigPath() {
    return getMcpConfigPath();
  }

  /**
   * Read MCP config file (supports both JSON and TOML)
   * Uses appropriate parser based on file extension
   */
  readMcpConfig() {
    const configPath = this.getMcpConfigPath();
    if (!fs.existsSync(configPath)) {
      return null;
    }

    const content = fs.readFileSync(configPath, 'utf-8');
    return this.parserFactory.parse(content, configPath);
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
