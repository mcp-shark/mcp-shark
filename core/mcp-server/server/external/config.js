import { readFileSync } from 'node:fs';
import { CompositeError, isError } from '#core/libraries/ErrorLibrary.js';

const DEFAULT_TYPE = 'stdio';
export class ConfigError extends CompositeError {
  constructor(message, error) {
    super('ConfigError', message, error);
  }
}

function parseConfig(configPath) {
  try {
    const conf = JSON.parse(readFileSync(configPath, 'utf-8'));
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
  const { servers, mcpServers } = parsedConfigResult;
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
