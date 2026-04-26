import { existsSync, readFileSync } from 'node:fs';
import { CompositeError, isError } from '#core/libraries/ErrorLibrary.js';
import { ConfigParserFactory } from '#core/services/parsers/ConfigParserFactory.js';

const DEFAULT_TYPE = 'stdio';

// An upstream entry is considered a self-reference (and pruned) when:
//   - its name is in this reserved set, OR
//   - it is an HTTP entry whose host:port resolves to mcp-shark's own
//     listening port. Including such an entry would loop the proxy back
//     onto itself at startup and crash with RunAllExternalServersError.
const RESERVED_UPSTREAM_NAMES = new Set(['mcp-shark']);

function isSelfReferencingEntry(name, cfg, selfPort) {
  if (RESERVED_UPSTREAM_NAMES.has(name)) {
    return { selfRef: true, reason: `reserved name '${name}'` };
  }
  if (!selfPort || !cfg || typeof cfg.url !== 'string') {
    return { selfRef: false };
  }
  let parsed;
  try {
    parsed = new URL(cfg.url);
  } catch {
    return { selfRef: false };
  }
  const port = Number.parseInt(parsed.port || (parsed.protocol === 'https:' ? '443' : '80'), 10);
  if (port !== selfPort) return { selfRef: false };
  const localHosts = new Set(['127.0.0.1', 'localhost', '0.0.0.0', '::1']);
  if (!localHosts.has(parsed.hostname)) return { selfRef: false };
  return {
    selfRef: true,
    reason: `URL ${parsed.hostname}:${port} points back at mcp-shark's own proxy`,
  };
}

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

export function normalizeConfig(configPath, options = {}) {
  const { selfPort, logger, allowEmpty = false } = options;
  const parsedConfigResult = parseConfig(configPath);
  if (isError(parsedConfigResult)) {
    return parsedConfigResult;
  }

  const normalized = parserFactory.normalizeToInternalFormat(parsedConfigResult, configPath);
  if (!normalized) {
    if (allowEmpty) return {};
    return new ConfigError('No servers found in config');
  }

  // Convert to flat map format expected by MCP server
  const out = new Map();
  const pruned = [];

  function addEntry(name, cfg) {
    const { selfRef, reason } = isSelfReferencingEntry(name, cfg, selfPort);
    if (selfRef) {
      pruned.push({ name, reason });
      return;
    }
    const type = cfg.type ?? DEFAULT_TYPE;
    out.set(name, { type, ...cfg });
  }

  // Handle normalized mcpServers format
  if (normalized.mcpServers) {
    for (const [name, cfg] of Object.entries(normalized.mcpServers)) {
      addEntry(name, cfg);
    }
  }

  // Handle normalized servers format (legacy)
  if (normalized.servers) {
    for (const [name, cfg] of Object.entries(normalized.servers)) {
      addEntry(name, cfg);
    }
  }

  if (pruned.length > 0 && logger?.warn) {
    for (const { name, reason } of pruned) {
      logger.warn(
        { upstream: name, reason },
        `[MCP-Shark] Skipping self-referencing upstream '${name}': ${reason}`
      );
    }
  }

  if (out.size === 0) {
    if (allowEmpty) {
      logger?.warn?.(
        { configPath },
        '[MCP-Shark] No upstream MCP servers configured — running in monitoring-only mode'
      );
      return {};
    }
    return new ConfigError('No servers found in config');
  }

  return Object.fromEntries(out);
}
