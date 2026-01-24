/**
 * Static Rules Service
 * Executes pattern-based security rules against MCP server definitions and traffic
 */
import { getAllRuleMetadata, getEnabledRules } from './rules/index.js';

export class StaticRulesService {
  constructor(logger) {
    this.logger = logger;
  }

  /**
   * Get all available rule metadata
   */
  getRuleMetadata() {
    return getAllRuleMetadata();
  }

  /**
   * Analyze a tool definition with all enabled rules
   */
  analyzeTool(tool, serverName = null) {
    const findings = [];
    const rules = getEnabledRules();

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
    const rules = getEnabledRules();

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
    const rules = getEnabledRules();

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
    const rules = getEnabledRules();

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

    // Analyze tools
    if (serverConfig.tools && Array.isArray(serverConfig.tools)) {
      for (const tool of serverConfig.tools) {
        findings.push(...this.analyzeTool(tool, serverName));
      }
    }

    // Analyze prompts
    if (serverConfig.prompts && Array.isArray(serverConfig.prompts)) {
      for (const prompt of serverConfig.prompts) {
        findings.push(...this.analyzePrompt(prompt, serverName));
      }
    }

    // Analyze resources
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
      // By severity
      if (summary.bySeverity[finding.severity] !== undefined) {
        summary.bySeverity[finding.severity]++;
      }

      // By OWASP ID
      if (finding.owasp_id) {
        summary.byOwasp[finding.owasp_id] = (summary.byOwasp[finding.owasp_id] || 0) + 1;
      }

      // By server
      if (finding.server_name) {
        summary.byServer[finding.server_name] = (summary.byServer[finding.server_name] || 0) + 1;
      }

      // By type
      if (summary.byType[finding.finding_type] !== undefined) {
        summary.byType[finding.finding_type]++;
      }
    }

    return summary;
  }
}
