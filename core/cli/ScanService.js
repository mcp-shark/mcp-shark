import { StaticRulesService } from '#core/services/security/StaticRulesService.js';
/**
 * Scan Service
 * Orchestrates: config detection → rule analysis → toxic flows → shark score
 * Pure business logic, no HTTP knowledge, no CLI formatting
 */
import { analyzeConfigPermissions } from '#core/services/security/rules/scans/configPermissions.js';
import { analyzeAllServerToolNames } from '#core/services/security/rules/scans/duplicateToolNames.js';
import { analyzeServerContainment } from '#core/services/security/rules/scans/missingContainment.js';
import { analyzeServerShellRisk } from '#core/services/security/rules/scans/shellEnvInjection.js';
import { getAllServers, scanIdeConfigs } from './ConfigScanner.js';
import { calculateSharkScore, countBySeverity } from './SharkScoreCalculator.js';
import { analyzeToxicFlows } from './ToxicFlowAnalyzer.js';

/**
 * Run a full security scan on all detected MCP configurations
 * @param {object} options
 * @param {string} [options.ide] - Filter to specific IDE
 * @param {boolean} [options.strict] - Count advisory findings in score
 * @returns {object} Complete scan result
 */
export function runScan(options = {}) {
  const startTime = Date.now();

  const ideResults = scanIdeConfigs({ ide: options.ide });
  const servers = getAllServers(ideResults);

  const rulesService = new StaticRulesService(null);
  const ruleMetadata = rulesService.getRuleMetadata();

  const allFindings = analyzeAllServers(servers, rulesService, ideResults);
  const toxicFlows = analyzeToxicFlows(servers);

  const scorableFindings = options.strict
    ? allFindings
    : allFindings.filter((f) => f.confidence !== 'possible');

  const scoreResult = calculateSharkScore(scorableFindings, toxicFlows);
  const severityCounts = countBySeverity(allFindings);
  const elapsedMs = Date.now() - startTime;

  const totalToolCount = servers.reduce(
    (sum, s) => sum + (Array.isArray(s.tools) ? s.tools.length : 0),
    0
  );

  return {
    ideResults,
    servers,
    findings: allFindings,
    findingsByServer: groupFindingsByServer(allFindings),
    toxicFlows,
    scoreResult,
    severityCounts,
    ruleCount: ruleMetadata.length,
    totalToolCount,
    serverCount: servers.length,
    elapsedMs,
    cleanServers: getCleanServers(servers, allFindings),
  };
}

/**
 * Analyze all servers with the static rules engine + config-level checks
 */
function analyzeAllServers(servers, rulesService, ideResults) {
  const findings = [];

  for (const server of servers) {
    const serverFindings = analyzeServer(server, rulesService);
    findings.push(...serverFindings);
  }

  const dupFindings = analyzeAllServerToolNames(servers);
  findings.push(...dupFindings);

  const permFindings = analyzeIdePermissions(ideResults);
  findings.push(...permFindings);

  return findings;
}

/**
 * Check permissions on all found IDE config files
 */
function analyzeIdePermissions(ideResults) {
  const findings = [];
  for (const ide of ideResults) {
    if (!ide.found || !ide.permissions) {
      continue;
    }
    const permFindings = analyzeConfigPermissions(ide.configPath, ide.permissions);
    findings.push(...permFindings);
  }
  return findings;
}

/**
 * Analyze a single server's tools with the rules engine
 */
function analyzeServer(server, rulesService) {
  const findings = [];

  const configFindings = analyzeServerConfig(server);
  findings.push(...configFindings);

  if (Array.isArray(server.tools)) {
    for (const tool of server.tools) {
      const toolObj = typeof tool === 'string' ? { name: tool } : tool;
      const toolFindings = rulesService.analyzeTool(toolObj, server.name);
      for (const f of toolFindings) {
        findings.push({
          ...f,
          ide: server.ide,
          config_path: server.configPath,
        });
      }
    }
  }

  const serverConfig = server.config || {};
  if (serverConfig.env) {
    const secretFindings = detectHardcodedSecrets(serverConfig.env, server);
    findings.push(...secretFindings);
  }

  return findings;
}

/**
 * Check for hardcoded secrets in server config environment variables
 */
function detectHardcodedSecrets(envVars, server) {
  const secretPatterns = [
    { pattern: /^ghp_[a-zA-Z0-9]{36,}$/, name: 'GitHub PAT', severity: 'high' },
    { pattern: /^gho_[a-zA-Z0-9]{36,}$/, name: 'GitHub OAuth', severity: 'high' },
    { pattern: /^sk-[a-zA-Z0-9]{20,}$/, name: 'API Key (sk-)', severity: 'high' },
    { pattern: /^xoxb-/, name: 'Slack Bot Token', severity: 'high' },
    { pattern: /^xoxp-/, name: 'Slack User Token', severity: 'critical' },
    { pattern: /^AKIA[A-Z0-9]{16}$/, name: 'AWS Access Key', severity: 'critical' },
    { pattern: /^glpat-/, name: 'GitLab PAT', severity: 'high' },
    { pattern: /^npm_[a-zA-Z0-9]{36,}$/, name: 'npm Token', severity: 'high' },
    { pattern: /^[a-f0-9]{40}$/, name: 'Hex Token (40 chars)', severity: 'medium' },
  ];

  const findings = [];

  for (const [key, value] of Object.entries(envVars)) {
    if (typeof value !== 'string') {
      continue;
    }
    if (value.startsWith('${') || value.startsWith('$')) {
      continue;
    }

    for (const { pattern, name, severity } of secretPatterns) {
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

/**
 * Analyze server-level config issues (containment + shell risks)
 */
function analyzeServerConfig(server) {
  const config = server.config || {};
  const findings = [];

  const containmentFindings = analyzeServerContainment(server.name, config);
  for (const f of containmentFindings) {
    findings.push({
      ...f,
      ide: server.ide,
      config_path: server.configPath,
    });
  }

  const shellFindings = analyzeServerShellRisk(server.name, config);
  for (const f of shellFindings) {
    findings.push({
      ...f,
      ide: server.ide,
      config_path: server.configPath,
    });
  }

  return findings;
}

/**
 * Group findings by server name
 */
function groupFindingsByServer(findings) {
  const grouped = {};
  for (const finding of findings) {
    const key = finding.server_name || 'unknown';
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(finding);
  }
  return grouped;
}

/**
 * Get list of servers with no findings
 */
function getCleanServers(servers, findings) {
  const serversWithFindings = new Set(findings.map((f) => f.server_name));
  return servers.filter((s) => !serversWithFindings.has(s.name)).map((s) => s.name);
}
