/**
 * Hardcoded Secret Detection
 * Detects API keys, tokens, and credentials hardcoded in MCP server env vars.
 */

const SECRET_PATTERNS = [
  { pattern: /^ghp_[a-zA-Z0-9]{36,}$/, name: 'GitHub PAT', severity: 'high' },
  { pattern: /^gho_[a-zA-Z0-9]{36,}$/, name: 'GitHub OAuth', severity: 'high' },
  { pattern: /^sk-[a-zA-Z0-9]{20,}$/, name: 'API Key (sk-)', severity: 'high' },
  { pattern: /^xoxb-/, name: 'Slack Bot Token', severity: 'high' },
  { pattern: /^xoxp-/, name: 'Slack User Token', severity: 'critical' },
  { pattern: /^AKIA[A-Z0-9]{16}$/, name: 'AWS Access Key', severity: 'critical' },
  { pattern: /^glpat-/, name: 'GitLab PAT', severity: 'high' },
  { pattern: /^npm_[a-zA-Z0-9]{36,}$/, name: 'npm Token', severity: 'high' },
  { pattern: /^[a-f0-9]{40}$/, name: 'Hex Token (40 chars)', severity: 'medium' },
  { pattern: /^AIza[a-zA-Z0-9_-]{35}$/, name: 'Google API Key', severity: 'high' },
  { pattern: /^SG\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/, name: 'SendGrid Key', severity: 'high' },
  { pattern: /^sk_live_[a-zA-Z0-9]+$/, name: 'Stripe Live Key', severity: 'critical' },
];

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
