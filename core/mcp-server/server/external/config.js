import { existsSync, readFileSync } from 'node:fs';
import { CompositeError, isError } from '#core/libraries/ErrorLibrary.js';
import { ConfigParserFactory } from '#core/services/parsers/ConfigParserFactory.js';

const DEFAULT_TYPE = 'stdio';

export class ConfigError extends CompositeError {
  constructor(message, error) {
    super('ConfigError', message, error);
  }
}

const parserFactory = new ConfigParserFactory();

function parseConfig(configPath) {
  if (!existsSync(configPath)) {
    return new ConfigError(
      'Config file not found',
      new Error(`Config file not found: ${configPath}`)
    );
  }

  try {
    const content = readFileSync(configPath, 'utf-8');
    const parsed = parserFactory.parse(content, configPath);

    if (parsed && typeof parsed === 'object') {
      return parsed;
    }

    return new ConfigError('Invalid config file', new Error(`Invalid config file: ${configPath}`));
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

  const normalized = parserFactory.normalizeToInternalFormat(parsedConfigResult, configPath);
  if (!normalized) {
    return new ConfigError('No servers found in config');
  }

  // Convert to flat map format expected by MCP server
  const out = new Map();

  // Handle normalized mcpServers format
  if (normalized.mcpServers) {
    for (const [name, cfg] of Object.entries(normalized.mcpServers)) {
      const type = cfg.type ?? DEFAULT_TYPE;
      out.set(name, { type, ...cfg });
    }
  }

  // Handle normalized servers format (legacy)
  if (normalized.servers) {
    for (const [name, cfg] of Object.entries(normalized.servers)) {
      const type = cfg.type ?? DEFAULT_TYPE;
      out.set(name, { type, ...cfg });
    }
  }

  if (out.size === 0) {
    return new ConfigError('No servers found in config');
  }

  return Object.fromEntries(out);
}
