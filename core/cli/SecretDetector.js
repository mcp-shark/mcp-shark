/**
 * Hardcoded Secret Detection
 * Detects API keys, tokens, and credentials hardcoded in MCP server env vars.
 *
 * Patterns are loaded from data/secret-patterns.json (built-in)
 * and merged with user overrides from .mcp-shark/secrets.yaml.
 */
import { loadBuiltinJson, loadUserYamlList } from './DataLoader.js';

const BUILTIN_PATTERNS = loadBuiltinJson('secret-patterns.json');
const USER_PATTERNS = loadUserYamlList('secrets.yaml');

const SECRET_PATTERNS = compilePatterns([...BUILTIN_PATTERNS, ...USER_PATTERNS]);

/**
 * Compile raw pattern definitions into regex objects
 * @param {Array<{pattern: string, name: string, severity: string}>} rawPatterns
 * @returns {Array<{pattern: RegExp, name: string, severity: string}>}
 */
function compilePatterns(rawPatterns) {
  const compiled = [];
  for (const entry of rawPatterns) {
    try {
      compiled.push({
        pattern: new RegExp(entry.pattern),
        name: entry.name,
        severity: entry.severity,
      });
    } catch (_err) {
      // skip malformed patterns from user overrides
    }
  }
  return compiled;
}

/**
 * Detect hardcoded secrets in server environment variables
 * @param {object} envVars - Environment variables from server config
 * @param {object} server - Server context (name, ide, configPath)
 * @returns {Array} Findings
 */
export function detectHardcodedSecrets(envVars, server) {
  const findings = [];

  for (const [key, value] of Object.entries(envVars)) {
    if (typeof value !== 'string') {
      continue;
    }
    if (value.startsWith('${') || value.startsWith('$')) {
      continue;
    }

    for (const { pattern, name, severity } of SECRET_PATTERNS) {
      if (pattern.test(value)) {
        const masked = maskSecret(value);
        findings.push({
          rule_id: 'hardcoded-secret',
          category: 'MCP01',
          severity,
          confidence: 'definite',
          title: `${name} hardcoded in config`,
          description: `${key}=${masked} — use environment variable reference instead`,
          server_name: server.name,
          ide: server.ide,
          config_path: server.configPath,
          fixable: true,
          fix_type: 'env_var_replacement',
          fix_data: { key, original: value },
        });
        break;
      }
    }
  }

  return findings;
}

/**
 * Mask a secret value for display
 */
function maskSecret(value) {
  if (value.length <= 8) {
    return '****';
  }
  return `${value.slice(0, 4)}****`;
}
