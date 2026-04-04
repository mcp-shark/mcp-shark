/**
 * YAML Rule Engine
 * Loads custom security rules from .mcp-shark/rules/*.yaml files.
 * Enables community-contributed rules without touching JS.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const RULES_DIR = '.mcp-shark/rules';
const YAML_EXTENSIONS = ['.yaml', '.yml'];

/**
 * Load all custom YAML rules from the rules directory
 * @param {string} [basePath] - Base path to search from (defaults to cwd)
 * @returns {Array} Parsed rule objects
 */
export function loadYamlRules(basePath) {
  const rulesPath = join(basePath || process.cwd(), RULES_DIR);

  if (!existsSync(rulesPath)) {
    return [];
  }

  const files = readdirSync(rulesPath).filter((f) =>
    YAML_EXTENSIONS.some((ext) => f.endsWith(ext))
  );

  const rules = [];
  for (const file of files) {
    const rule = parseYamlRule(join(rulesPath, file));
    if (rule) {
      rules.push(rule);
    }
  }

  return rules;
}

/**
 * Parse a single YAML rule file using simple key-value parsing
 * (avoids adding a YAML dependency just for rules)
 */
function parseYamlRule(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const rule = parseSimpleYaml(content);

    if (!rule.id || !rule.name || !rule.severity) {
      return null;
    }

    return {
      id: `custom-${rule.id}`,
      name: rule.name,
      severity: rule.severity,
      description: rule.description || '',
      message: rule.message || '',
      match: parseMatchBlock(rule),
      source: filePath,
    };
  } catch (_err) {
    return null;
  }
}

/**
 * Parse simple YAML (flat key-value + one-level nesting)
 */
function parseSimpleYaml(content) {
  const result = {};
  const lines = content.split('\n');
  let currentSection = null;

  for (const rawLine of lines) {
    const line = rawLine.replace(/#.*$/, '').trimEnd();
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
    const value = trimmed
      .slice(colonIdx + 1)
      .trim()
      .replace(/^["']|["']$/g, '');

    if (indent === 0) {
      if (value) {
        result[key] = value;
        currentSection = null;
      } else {
        result[key] = {};
        currentSection = key;
      }
    } else if (currentSection && result[currentSection]) {
      result[currentSection][key] = value;
    }
  }

  return result;
}

/**
 * Extract match conditions from parsed rule
 */
function parseMatchBlock(rule) {
  const match = rule.match || {};
  return {
    envPattern: match.env_pattern ? new RegExp(match.env_pattern, 'i') : null,
    valuePattern: match.value_pattern ? new RegExp(match.value_pattern, 'i') : null,
    serverPattern: match.server_pattern ? new RegExp(match.server_pattern, 'i') : null,
    toolPattern: match.tool_pattern ? new RegExp(match.tool_pattern, 'i') : null,
    descriptionPattern: match.description_pattern
      ? new RegExp(match.description_pattern, 'i')
      : null,
  };
}

/**
 * Apply custom YAML rules to a scan context
 * @param {Array} yamlRules - Loaded YAML rules
 * @param {Array} servers - Servers from ConfigScanner
 * @returns {Array} Findings
 */
export function applyYamlRules(yamlRules, servers) {
  const findings = [];

  for (const rule of yamlRules) {
    for (const server of servers) {
      const serverFindings = evaluateRule(rule, server);
      findings.push(...serverFindings);
    }
  }

  return findings;
}

/**
 * Evaluate a single YAML rule against a server
 */
function evaluateRule(rule, server) {
  const findings = [];
  const match = rule.match;

  if (match.serverPattern?.test(server.name)) {
    findings.push(buildFinding(rule, server, 'Server name matches pattern'));
  }

  if (match.envPattern && server.config?.env) {
    for (const [key, value] of Object.entries(server.config.env)) {
      const keyMatch = match.envPattern.test(key);
      const valMatch = match.valuePattern ? match.valuePattern.test(String(value)) : true;
      if (keyMatch && valMatch) {
        const msg = rule.message
          ? rule.message.replace('{key}', key).replace('{server}', server.name)
          : `${key} matches custom rule "${rule.name}"`;
        findings.push(buildFinding(rule, server, msg));
      }
    }
  }

  if (match.toolPattern && Array.isArray(server.tools)) {
    for (const tool of server.tools) {
      const toolObj = typeof tool === 'string' ? { name: tool } : tool;
      if (match.toolPattern.test(toolObj.name || '')) {
        findings.push(buildFinding(rule, server, `Tool "${toolObj.name}" matches pattern`));
      }
    }
  }

  return findings;
}

/**
 * Build a finding from a YAML rule match
 */
function buildFinding(rule, server, message) {
  return {
    rule_id: rule.id,
    severity: rule.severity,
    title: `${rule.name}: ${server.name}`,
    description: message,
    recommendation: rule.description,
    server_name: server.name,
    ide: server.ide,
    config_path: server.configPath,
    confidence: 'advisory',
    source: 'yaml-rule',
  };
}
