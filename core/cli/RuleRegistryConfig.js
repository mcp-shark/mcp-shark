/**
 * Resolves rule registry URL and update policy without hardcoding beyond bootstrap defaults.
 *
 * Precedence (highest first):
 *   1. CLI --source (passed in as overrideUrl)
 *   2. MCP_SHARK_RULE_REGISTRY
 *   3. .mcp-shark/rule-registry.json (project cwd)
 *   4. ~/.config/mcp-shark/rule-registry.json (XDG-style)
 *   5. Built-in rule-sources.json
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { loadBuiltinJson } from './DataLoader.js';

const BUILTIN = loadBuiltinJson('rule-sources.json');

function projectRegistryPath() {
  return join(process.cwd(), '.mcp-shark', 'rule-registry.json');
}

function userRegistryPath() {
  const base = process.env.XDG_CONFIG_HOME || join(homedir(), '.config');
  return join(base, 'mcp-shark', 'rule-registry.json');
}

/**
 * @param {object} raw
 * @returns {object|null}
 */
function parseRegistryFile(rawPath) {
  if (!existsSync(rawPath)) {
    return null;
  }
  try {
    const parsed = JSON.parse(readFileSync(rawPath, 'utf-8'));
    return typeof parsed === 'object' && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Reject cache_dir path traversal and absolute paths.
 * @param {string} rel
 */
function assertSafeRelativeCacheDir(rel) {
  if (typeof rel !== 'string' || rel.length === 0) {
    return;
  }
  if (rel.includes('..') || rel.startsWith('/') || /^[A-Za-z]:[\\/]/.test(rel)) {
    throw new Error('rule-registry.json cache_dir must be a relative path without ..');
  }
}

/**
 * @param {object} [opts]
 * @param {string} [opts.overrideUrl] - from CLI --source
 * @returns {{
 *   registryUrl: string,
 *   cacheDir: string,
 *   autoUpdate: boolean,
 *   autoUpdateMaxAgeHours: number
 * }}
 */
export function resolveRuleRegistryConfig(opts = {}) {
  const projectFile = parseRegistryFile(projectRegistryPath());
  const userFile = parseRegistryFile(userRegistryPath());

  const merged = {
    ...BUILTIN,
    ...(userFile || {}),
    ...(projectFile || {}),
  };

  if (merged.cache_dir) {
    assertSafeRelativeCacheDir(merged.cache_dir);
  }

  const cliUrl = opts.overrideUrl && String(opts.overrideUrl).trim();
  const envUrl = process.env.MCP_SHARK_RULE_REGISTRY?.trim();
  const registryUrl = cliUrl || envUrl || merged.registry_url || BUILTIN.registry_url;

  const cacheDirRel = merged.cache_dir || BUILTIN.cache_dir;
  assertSafeRelativeCacheDir(cacheDirRel);
  const cacheDir = join(process.cwd(), cacheDirRel);

  const autoUpdate = merged.auto_update === true;
  const autoUpdateMaxAgeHours = Number(merged.auto_update_max_age_hours);
  const builtinMax = Number(BUILTIN.default_auto_update_max_age_hours);
  const maxAge =
    Number.isFinite(autoUpdateMaxAgeHours) && autoUpdateMaxAgeHours > 0
      ? autoUpdateMaxAgeHours
      : Number.isFinite(builtinMax) && builtinMax > 0
        ? builtinMax
        : 168;

  return {
    registryUrl,
    cacheDir,
    autoUpdate,
    autoUpdateMaxAgeHours: maxAge,
  };
}

/**
 * True when cache has no packs or newest pack file is older than maxAgeHours.
 * @param {string} cacheDir
 * @param {number} maxAgeHours
 */
export function isRuleCacheStale(cacheDir, maxAgeHours) {
  if (!existsSync(cacheDir)) {
    return true;
  }

  const files = readdirSync(cacheDir).filter((f) => f.endsWith('.json') && f !== '.meta.json');
  if (files.length === 0) {
    return true;
  }

  let newest = 0;
  for (const f of files) {
    const m = statSync(join(cacheDir, f)).mtimeMs;
    if (m > newest) {
      newest = m;
    }
  }

  const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
  return Date.now() - newest > maxAgeMs;
}
