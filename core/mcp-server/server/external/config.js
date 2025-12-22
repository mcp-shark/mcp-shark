import { existsSync, readFileSync } from 'node:fs';
import { extname } from 'node:path';
import { parse as parseToml } from '@iarna/toml';
import { CompositeError, isError } from '#core/libraries/ErrorLibrary.js';

const DEFAULT_TYPE = 'stdio';
export class ConfigError extends CompositeError {
  constructor(message, error) {
    super('ConfigError', message, error);
  }
}

function parseConfig(configPath) {
  if (!existsSync(configPath)) {
    return new ConfigError(
      'Config file not found',
      new Error(`Config file not found: ${configPath}`)
    );
  }

  try {
    const content = readFileSync(configPath, 'utf-8');
    const ext = extname(configPath).toLowerCase();

    if (ext === '.toml') {
      const conf = parseToml(content);
      if (conf && typeof conf === 'object') {
        return conf;
      }
      return new ConfigError(
        'Invalid TOML config file',
        new Error(`Invalid TOML config file: ${configPath}`)
      );
    }

    const conf = JSON.parse(content);
    if (conf && typeof conf === 'object') {
      return conf;
    }
    return new ConfigError(
      'Invalid config file',
      new Error(`Invalid config file: ${configPath} - ${JSON.stringify(conf, null, 2)}`)
    );
  } catch (error) {
    return new ConfigError(
      'Error parsing config',
      new Error(`Error parsing config: ${configPath} - ${error.message}`)
    );
  }
}

export function normalizeConfig(configPath) {
  const parsedConfigResult = parseConfig(configPath);
  if (isError(parsedConfigResult)) {
    return parsedConfigResult;
  }
  const out = new Map();
  const { servers, mcpServers, mcp_servers } = parsedConfigResult;

  // Handle Codex TOML format: mcp_servers (with underscore)
  if (mcp_servers) {
    Object.entries(mcp_servers).forEach(([name, cfg]) => {
      if (!cfg || typeof cfg !== 'object') {
        return;
      }

      const converted = {
        type: cfg.url ? 'http' : DEFAULT_TYPE,
      };

      if (cfg.command) {
        converted.command = cfg.command;
      }

      if (Array.isArray(cfg.args)) {
        converted.args = cfg.args;
      }

      if (cfg.env && typeof cfg.env === 'object') {
        converted.env = cfg.env;
      }

      if (cfg.url) {
        converted.url = cfg.url;
        if (cfg.headers && typeof cfg.headers === 'object') {
          converted.headers = cfg.headers;
        }
      }

      out.set(name, converted);
    });
  }

  // Servers are the old format
  if (servers) {
    Object.entries(servers).forEach(([name, cfg]) => {
      const type = cfg.type ?? DEFAULT_TYPE;
      out.set(name, { type, ...cfg });
    });
  }

  // MCP Servers are the new format
  if (mcpServers) {
    Object.entries(mcpServers).forEach(([name, cfg]) => {
      // Cursor/Claude usually omit type; assume stdio if command is given
      const type = cfg.type ?? DEFAULT_TYPE;
      out.set(name, { type, ...cfg });
    });
  }

  if (out.size === 0) {
    return new ConfigError('No servers found in config');
  }

  return Object.fromEntries(out);
}
