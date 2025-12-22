import * as path from 'node:path';
import { JsonConfigParser } from './JsonConfigParser.js';
import { LegacyJsonConfigParser } from './LegacyJsonConfigParser.js';
import { TomlConfigParser } from './TomlConfigParser.js';

/**
 * Factory for creating appropriate config parsers based on file type
 * Provides unified interface for all config format parsing
 */
export class ConfigParserFactory {
  constructor() {
    this.tomlParser = new TomlConfigParser();
    this.jsonParser = new JsonConfigParser();
    this.legacyParser = new LegacyJsonConfigParser();
  }

  /**
   * Detect file format from path
   * @param {string} filePath - File path
   * @returns {string} Format type: 'toml', 'json', or null
   */
  detectFormat(filePath) {
    if (!filePath) {
      return null;
    }
    const ext = path.extname(filePath).toLowerCase();
    return ext === '.toml' ? 'toml' : ext === '.json' ? 'json' : null;
  }

  /**
   * Get appropriate parser for file format
   * @param {string} filePath - File path
   * @returns {TomlConfigParser|JsonConfigParser|LegacyJsonConfigParser} Parser instance
   */
  getParser(filePath) {
    const format = this.detectFormat(filePath);
    if (format === 'toml') {
      return this.tomlParser;
    }
    return this.jsonParser;
  }

  /**
   * Parse config content and detect format
   * @param {string} content - Config file content
   * @param {string} filePath - File path (optional, for format detection)
   * @returns {Object|null} Parsed config or null on error
   */
  parse(content, filePath = null) {
    const format = filePath ? this.detectFormat(filePath) : null;

    if (format === 'toml') {
      return this.tomlParser.parse(content);
    }

    return this.jsonParser.parse(content);
  }

  /**
   * Normalize config to internal format
   * Handles all formats: TOML (Codex), JSON (standard), JSON (legacy)
   * @param {Object} config - Parsed config object
   * @param {string} filePath - Original file path (optional)
   * @returns {Object|null} Normalized config in internal format
   */
  normalizeToInternalFormat(config, _filePath = null) {
    if (!config || typeof config !== 'object') {
      return null;
    }

    // Try TOML format first (Codex)
    if (this.tomlParser.isCodexFormat(config)) {
      return this.tomlParser.convertToMcpSharkFormat(config);
    }

    // Try standard JSON format
    if (this.jsonParser.isMcpServersFormat(config)) {
      return this.jsonParser.normalizeToInternalFormat(config);
    }

    // Try legacy format
    if (this.legacyParser.isLegacyFormat(config)) {
      return this.legacyParser.convertToInternalFormat(config);
    }

    // If config has both mcpServers and servers, prefer mcpServers
    if (config.mcpServers && typeof config.mcpServers === 'object') {
      return this.jsonParser.normalizeToInternalFormat(config);
    }

    // If config has servers, treat as legacy
    if (config.servers && typeof config.servers === 'object') {
      return this.legacyParser.convertToInternalFormat(config);
    }

    return null;
  }

  /**
   * Parse and normalize config in one step
   * @param {string} content - Config file content
   * @param {string} filePath - File path
   * @returns {Object|null} Normalized config in internal format or null
   */
  parseAndNormalize(content, filePath) {
    const parsed = this.parse(content, filePath);
    if (!parsed) {
      return null;
    }

    return this.normalizeToInternalFormat(parsed, filePath);
  }
}
