/**
 * Data Loader
 * Loads built-in JSON data files and merges with user YAML overrides
 * from .mcp-shark/ directory. Keeps hardcoded values in config, not code.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DATA_DIR = join(import.meta.dirname, 'data');
const USER_CONFIG_DIR = '.mcp-shark';

/**
 * Load a built-in JSON data file from core/cli/data/
 * @param {string} filename - e.g. 'secret-patterns.json'
 * @returns {any} Parsed JSON content
 */
export function loadBuiltinJson(filename) {
  const filePath = join(DATA_DIR, filename);
  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Load user YAML overrides from .mcp-shark/<filename> relative to cwd
 * Returns null if file does not exist.
 * @param {string} filename - e.g. 'secrets.yaml'
 * @returns {string|null} Raw file content or null
 */
function loadUserYamlContent(filename) {
  const filePath = join(process.cwd(), USER_CONFIG_DIR, filename);
  if (!existsSync(filePath)) {
    return null;
  }
  return readFileSync(filePath, 'utf-8');
}

/**
 * Load user overrides as a list of objects (for secrets, flows)
 * Expects YAML format:
 *   - pattern: "^foo"
 *     name: "Foo Key"
 *     severity: high
 * @param {string} filename
 * @returns {Array<object>}
 */
export function loadUserYamlList(filename) {
  const content = loadUserYamlContent(filename);
  if (!content) {
    return [];
  }
  return parseYamlList(content);
}

/**
 * Collect `toxic_flow_rules` arrays from rule-pack JSON files in a directory
 * (built-in `core/cli/data/rule-packs` and/or `.mcp-shark/rule-packs`).
 * @param {string} dirPath absolute or cwd-relative directory
 * @returns {Array<object>}
 */
export function loadToxicFlowRulesFromPacksDir(dirPath) {
  if (!existsSync(dirPath)) {
    return [];
  }
  const out = [];
  for (const file of readdirSync(dirPath)) {
    if (!file.endsWith('.json')) {
      continue;
    }
    try {
      const pack = JSON.parse(readFileSync(join(dirPath, file), 'utf-8'));
      if (!pack?.schema_version || !Array.isArray(pack.rules)) {
        continue;
      }
      const extra = pack.toxic_flow_rules;
      if (Array.isArray(extra)) {
        out.push(...extra);
      }
    } catch {
      // skip malformed pack files
    }
  }
  return out;
}

/**
 * Load user overrides as a nested map (for classifications)
 * Expects YAML format:
 *   mcp-server-notion:
 *     read_page: ingests_untrusted
 * @param {string} filename
 * @returns {object}
 */
export function loadUserYamlMap(filename) {
  const content = loadUserYamlContent(filename);
  if (!content) {
    return {};
  }
  return parseYamlNestedMap(content);
}

/**
 * Parse YAML list of objects.
 * Each item starts with "- key: value" and subsequent keys at +2 indent.
 */
function parseYamlList(content) {
  const items = [];
  let current = null;

  for (const rawLine of content.split('\n')) {
    const line = stripComment(rawLine);
    if (!line.trim()) {
      continue;
    }

    const listMatch = line.match(/^- (\w[\w_]*)\s*:\s*(.*)$/);
    if (listMatch) {
      if (current) {
        items.push(current);
      }
      current = {};
      current[listMatch[1]] = unquote(listMatch[2]);
      continue;
    }

    const propMatch = line.match(/^\s{2,}(\w[\w_]*)\s*:\s*(.*)$/);
    if (propMatch && current) {
      current[propMatch[1]] = unquote(propMatch[2]);
    }
  }

  if (current) {
    items.push(current);
  }

  return items;
}

/**
 * Parse YAML nested map (two levels deep).
 *   top_key:
 *     sub_key: value
 */
function parseYamlNestedMap(content) {
  const result = {};
  let currentSection = null;

  for (const rawLine of content.split('\n')) {
    const line = stripComment(rawLine);
    if (!line.trim()) {
      continue;
    }

    const indent = line.length - line.trimStart().length;
    const trimmed = line.trim();
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) {
      continue;
    }

    const key = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim();

    if (indent === 0) {
      if (value) {
        result[key] = unquote(value);
      } else {
        result[key] = {};
        currentSection = key;
      }
    } else if (currentSection && typeof result[currentSection] === 'object') {
      result[currentSection][key] = unquote(value);
    }
  }

  return result;
}

/**
 * Remove inline YAML comments (respecting quoted strings)
 */
function stripComment(line) {
  const trimmed = line.trimEnd();
  const hashIdx = trimmed.indexOf(' #');
  if (hashIdx === -1) {
    return trimmed;
  }
  const beforeHash = trimmed.slice(0, hashIdx);
  const quoteCount = (beforeHash.match(/"/g) || []).length;
  if (quoteCount % 2 === 0) {
    return beforeHash;
  }
  return trimmed;
}

/**
 * Remove surrounding quotes from a YAML value
 */
function unquote(value) {
  return value.replace(/^["']|["']$/g, '');
}
