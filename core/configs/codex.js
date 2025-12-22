import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ConfigParserFactory } from '#core/services/parsers/ConfigParserFactory.js';
import { Environment } from './environment.js';

const parserFactory = new ConfigParserFactory();

/**
 * Get Codex config.toml path
 * Codex uses $CODEX_HOME/config.toml, defaulting to ~/.codex/config.toml
 * @returns {string} Path to Codex config file
 */
export function getCodexConfigPath() {
  const codexHome = Environment.getCodexHome();
  return join(codexHome, 'config.toml');
}

/**
 * Check if Codex config.toml exists
 */
export function codexConfigExists() {
  return existsSync(getCodexConfigPath());
}

/**
 * Read and parse Codex config.toml
 * Uses TomlConfigParser for parsing
 */
export function readCodexConfig() {
  const configPath = getCodexConfigPath();
  if (!existsSync(configPath)) {
    return null;
  }

  try {
    const content = readFileSync(configPath, 'utf-8');
    return parserFactory.parse(content, configPath);
  } catch (_error) {
    return null;
  }
}

/**
 * Convert Codex mcp_servers TOML format to MCP Shark JSON format
 * Uses TomlConfigParser for conversion
 * @deprecated Use ConfigParserFactory.normalizeToInternalFormat() instead
 */
export function convertCodexConfigToMcpShark(codexConfig) {
  return parserFactory.normalizeToInternalFormat(codexConfig);
}

/**
 * Read Codex config and convert to MCP Shark format
 * Uses ConfigParserFactory for unified parsing and conversion
 */
export function readCodexConfigAsMcpShark() {
  const configPath = getCodexConfigPath();
  if (!existsSync(configPath)) {
    return null;
  }

  try {
    const content = readFileSync(configPath, 'utf-8');
    return parserFactory.parseAndNormalize(content, configPath);
  } catch (_error) {
    return null;
  }
}
