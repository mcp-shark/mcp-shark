/**
 * Static Rules Service
 * Executes pattern-based security rules against MCP server definitions and traffic.
 *
 * Combines two rule sources:
 *   1. JS plugin rules (structural/scored — from rules/index.js)
 *   2. Declarative JSON rule packs (pattern-based — from DeclarativeRuleEngine)
 */
import { loadDeclarativeRules } from '#core/cli/DeclarativeRuleEngine.js';
import { getAllRuleMetadata, getEnabledRules } from './rules/index.js';

let cachedCombinedRules = null;

/**
 * Load and cache the combined set of JS plugin + declarative rules.
 */
function getCombinedRules() {
  if (cachedCombinedRules) {
    return cachedCombinedRules;
  }

  const jsRules = getEnabledRules();
  const declarativeRules = loadDeclarativeRules().map((rule) => ({
    id: rule.ruleMetadata.id,
    ...rule.ruleMetadata,
    analyzeTool: rule.analyzeTool,
    analyzePrompt: rule.analyzePrompt,
    analyzeResource: rule.analyzeResource,
    analyzePacket: rule.analyzePacket,
  }));

  const ruleMap = new Map();
  for (const rule of jsRules) {
    ruleMap.set(rule.id, rule);
  }
  for (const rule of declarativeRules) {
    ruleMap.set(rule.id, rule);
  }

  cachedCombinedRules = [...ruleMap.values()];
  return cachedCombinedRules;
}

/**
 * Get combined metadata from JS plugins + declarative packs.
 */
function getCombinedMetadata() {
  const jsMetadata = getAllRuleMetadata();
  const declarativeRules = loadDeclarativeRules();
  const declarativeMetadata = declarativeRules.map((r) => r.ruleMetadata);

  const metaMap = new Map();
  for (const m of jsMetadata) {
    metaMap.set(m.id, m);
  }
  for (const m of declarativeMetadata) {
    metaMap.set(m.id, m);
  }

  return [...metaMap.values()];
}

export class StaticRulesService {
  constructor(logger) {
    this.logger = logger;
  }

  /**
   * Get all available rule metadata
   */
  getRuleMetadata() {
    return getCombinedMetadata();
  }

  /**
   * Analyze a tool definition with all enabled rules
   */
  analyzeTool(tool, serverName = null) {
    const findings = [];
    const rules = getCombinedRules();

    for (const rule of rules) {
      try {
        const ruleFindings = rule.analyzeTool(tool);
        for (const finding of ruleFindings) {
          findings.push({
            ...finding,
            server_name: serverName,
            finding_type: 'config',
          });
        }
      } catch (error) {
        this.logger?.error(
          { ruleId: rule.id, error: error.message },
          'Error executing rule on tool'
        );
      }
    }

    return findings;
  }

  /**
   * Analyze a prompt definition with all enabled rules
   */
  analyzePrompt(prompt, serverName = null) {
    const findings = [];
    const rules = getCombinedRules();

    for (const rule of rules) {
      try {
        const ruleFindings = rule.analyzePrompt(prompt);
        for (const finding of ruleFindings) {
          findings.push({
            ...finding,
            server_name: serverName,
            finding_type: 'config',
          });
        }
      } catch (error) {
        this.logger?.error(
          { ruleId: rule.id, error: error.message },
          'Error executing rule on prompt'
        );
      }
    }

    return findings;
  }

  /**
   * Analyze a resource definition with all enabled rules
   */
  analyzeResource(resource, serverName = null) {
    const findings = [];
    const rules = getCombinedRules();

    for (const rule of rules) {
      try {
        const ruleFindings = rule.analyzeResource(resource);
        for (const finding of ruleFindings) {
          findings.push({
            ...finding,
            server_name: serverName,
            finding_type: 'config',
          });
        }
      } catch (error) {
        this.logger?.error(
          { ruleId: rule.id, error: error.message },
          'Error executing rule on resource'
        );
      }
    }

    return findings;
  }

  /**
   * Analyze a packet with all enabled rules
   */
  analyzePacket(packet, sessionId = null) {
    const findings = [];
    const rules = getCombinedRules();

    for (const rule of rules) {
      try {
        const ruleFindings = rule.analyzePacket(packet);
        for (const finding of ruleFindings) {
          findings.push({
            ...finding,
            session_id: sessionId,
            frame_number: packet.frameNumber,
            finding_type: 'traffic',
          });
        }
      } catch (error) {
        this.logger?.error(
          { ruleId: rule.id, error: error.message },
          'Error executing rule on packet'
        );
      }
    }

    return findings;
  }

  /**
   * Analyze an entire MCP server configuration
   */
  analyzeServerConfig(serverConfig) {
    const serverName = serverConfig.name || 'unknown';
    const findings = [];

    if (serverConfig.tools && Array.isArray(serverConfig.tools)) {
      for (const tool of serverConfig.tools) {
        findings.push(...this.analyzeTool(tool, serverName));
      }
    }

    if (serverConfig.prompts && Array.isArray(serverConfig.prompts)) {
      for (const prompt of serverConfig.prompts) {
        findings.push(...this.analyzePrompt(prompt, serverName));
      }
    }

    if (serverConfig.resources && Array.isArray(serverConfig.resources)) {
      for (const resource of serverConfig.resources) {
        findings.push(...this.analyzeResource(resource, serverName));
      }
    }

    return findings;
  }

  /**
   * Analyze multiple servers at once
   */
  analyzeMultipleServers(servers) {
    const allFindings = [];

    for (const server of servers) {
      const findings = this.analyzeServerConfig(server);
      allFindings.push(...findings);
    }

    return allFindings;
  }

  /**
   * Get summary statistics for findings
   */
  summarizeFindings(findings) {
    const summary = {
      total: findings.length,
      bySeverity: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
      },
      byOwasp: {},
      byServer: {},
      byType: {
        config: 0,
        traffic: 0,
      },
    };

    for (const finding of findings) {
      if (summary.bySeverity[finding.severity] !== undefined) {
        summary.bySeverity[finding.severity]++;
      }

      if (finding.owasp_id) {
        summary.byOwasp[finding.owasp_id] = (summary.byOwasp[finding.owasp_id] || 0) + 1;
      }

      if (finding.server_name) {
        summary.byServer[finding.server_name] = (summary.byServer[finding.server_name] || 0) + 1;
      }

      if (summary.byType[finding.finding_type] !== undefined) {
        summary.byType[finding.finding_type]++;
      }
    }

    return summary;
  }
}
