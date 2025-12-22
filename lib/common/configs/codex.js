import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { parse as parseToml } from '@iarna/toml';

/**
 * Get Codex config.toml path
 * Codex uses $CODEX_HOME/config.toml, defaulting to ~/.codex/config.toml
 */
export function getCodexConfigPath() {
  const codexHome = process.env.CODEX_HOME || join(homedir(), '.codex');
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
 */
export function readCodexConfig() {
  const configPath = getCodexConfigPath();
  if (!existsSync(configPath)) {
    return null;
  }

  try {
    const content = readFileSync(configPath, 'utf-8');
    return parseToml(content);
  } catch (_error) {
    return null;
  }
}

/**
 * Convert Codex mcp_servers TOML format to MCP Shark JSON format
 * Codex format:
 *   [mcp_servers."server-name"]
 *   command = "/path/to/command"
 *   args = ["arg1", "arg2"]
 *   env.KEY = "value"
 *
 * MCP Shark format:
 *   {
 *     "mcpServers": {
 *       "server-name": {
 *         "type": "stdio",
 *         "command": "/path/to/command",
 *         "args": ["arg1", "arg2"],
 *         "env": {
 *           "KEY": "value"
 *         }
 *       }
 *     }
 *   }
 */
export function convertCodexConfigToMcpShark(codexConfig) {
  if (!codexConfig || !codexConfig.mcp_servers) {
    return null;
  }

  const mcpServers = {};

  for (const [serverName, serverConfig] of Object.entries(codexConfig.mcp_servers)) {
    if (!serverConfig || typeof serverConfig !== 'object') {
      continue;
    }

    const converted = {
      type: 'stdio',
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
      converted.type = 'http';
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

/**
 * Read Codex config and convert to MCP Shark format
 */
export function readCodexConfigAsMcpShark() {
  const codexConfig = readCodexConfig();
  if (!codexConfig) {
    return null;
  }

  return convertCodexConfigToMcpShark(codexConfig);
}
