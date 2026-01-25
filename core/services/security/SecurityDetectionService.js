/**
 * Security Detection Service
 * Main orchestrator for security vulnerability detection
 * Combines static rules, config analysis, and traffic analysis
 */
import { randomUUID } from 'node:crypto';

export class SecurityDetectionService {
  constructor(staticRulesService, securityFindingsRepository, yaraEngine, logger) {
    this.staticRulesService = staticRulesService;
    this.findingsRepository = securityFindingsRepository;
    this.yaraEngine = yaraEngine;
    this.logger = logger;
  }

  /**
   * Get all available rule metadata
   */
  getRules() {
    return this.staticRulesService.getRuleMetadata();
  }

  /**
   * Scan a single MCP server configuration
   */
  async scanServerConfig(serverConfig) {
    const scanId = randomUUID();
    const findings = this.staticRulesService.analyzeServerConfig(serverConfig);

    // Run YARA scans on server config content
    const yaraFindings = await this._runYaraConfigScan(serverConfig);
    const allFindings = [...findings, ...yaraFindings];

    // Store findings
    if (allFindings.length > 0) {
      this.findingsRepository.insertFindings(allFindings, scanId);
      this.logger?.info(
        { serverName: serverConfig.name, findingsCount: allFindings.length, scanId },
        'Security scan completed'
      );
    }

    return {
      scanId,
      serverName: serverConfig.name,
      findingsCount: allFindings.length,
      findings: allFindings,
      summary: this.staticRulesService.summarizeFindings(allFindings),
    };
  }

  /**
   * Run YARA scans on server configuration content
   */
  async _runYaraConfigScan(serverConfig) {
    if (!this.yaraEngine) {
      return [];
    }

    const findings = [];
    const serverName = serverConfig.name;
    const scanItems = [
      { items: serverConfig.tools, targetType: 'tool' },
      { items: serverConfig.prompts, targetType: 'prompt' },
      { items: serverConfig.resources, targetType: 'resource' },
    ];

    for (const { items, targetType } of scanItems) {
      if (!items || !Array.isArray(items)) {
        continue;
      }
      for (const item of items) {
        const result = await this.yaraEngine.scan(JSON.stringify(item), { serverName, targetType });
        if (result.findings?.length > 0) {
          findings.push(...result.findings);
        }
      }
    }

    return findings;
  }

  /**
   * Scan multiple MCP servers
   */
  async scanMultipleServers(servers) {
    const scanId = randomUUID();
    const allFindings = [];
    const results = [];

    // Get server names for cleanup
    const serverNames = servers.map((s) => s.name).filter(Boolean);

    // Delete old config findings for these servers to avoid duplicates
    if (serverNames.length > 0) {
      const deletedCount = this.findingsRepository.deleteConfigFindingsByServers(serverNames);
      if (deletedCount > 0) {
        this.logger?.debug(
          { serverNames, deletedCount },
          'Cleared old config findings before rescan'
        );
      }
    }

    for (const server of servers) {
      const findings = this.staticRulesService.analyzeServerConfig(server);
      const yaraFindings = await this._runYaraConfigScan(server);
      const serverFindings = [...findings, ...yaraFindings];

      allFindings.push(...serverFindings);
      results.push({
        serverName: server.name,
        findingsCount: serverFindings.length,
        summary: this.staticRulesService.summarizeFindings(serverFindings),
      });
    }

    // Store all findings with the same scan ID
    if (allFindings.length > 0) {
      this.findingsRepository.insertFindings(allFindings, scanId);
    }

    this.logger?.info(
      { serversCount: servers.length, totalFindings: allFindings.length, scanId },
      'Batch security scan completed'
    );

    return {
      scanId,
      serversScanned: servers.length,
      totalFindings: allFindings.length,
      results,
      summary: this.staticRulesService.summarizeFindings(allFindings),
    };
  }

  /**
   * Analyze a single packet for security issues
   * Called in real-time as traffic flows through
   */
  async analyzePacket(packet, sessionId = null) {
    const findings = this.staticRulesService.analyzePacket(packet, sessionId);

    // Run YARA scan on packet content
    const yaraFindings = await this._runYaraPacketScan(packet, sessionId);
    const allFindings = [...findings, ...yaraFindings];

    // Store findings immediately for real-time traffic
    if (allFindings.length > 0) {
      this.findingsRepository.insertFindings(allFindings);
      this.logger?.debug(
        { frameNumber: packet.frameNumber, findingsCount: allFindings.length },
        'Security findings in packet'
      );
    }

    return allFindings;
  }

  /**
   * Run YARA scan on packet content
   */
  async _runYaraPacketScan(packet, sessionId) {
    if (!this.yaraEngine || !packet.body) {
      return [];
    }

    const result = await this.yaraEngine.scan(packet.body, {
      sessionId,
      targetType: 'packet',
      frameNumber: packet.frameNumber,
    });

    return result.findings || [];
  }

  /**
   * Get findings with filters
   */
  getFindings(filters = {}) {
    return this.findingsRepository.getFindings(filters);
  }

  /**
   * Get finding by ID
   */
  getFindingById(id) {
    return this.findingsRepository.getFindingById(id);
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    return this.findingsRepository.getSummary();
  }

  /**
   * Get findings count
   */
  getFindingsCount(filters = {}) {
    return this.findingsRepository.getFindingsCount(filters);
  }

  /**
   * Delete findings for a scan
   */
  deleteScanFindings(scanId) {
    return this.findingsRepository.deleteFindingsByScanId(scanId);
  }

  /**
   * Clear all findings
   */
  clearAllFindings() {
    return this.findingsRepository.deleteAllFindings();
  }

  /**
   * Get scan history
   */
  getScanHistory(limit = 20) {
    return this.findingsRepository.getScanHistory(limit);
  }

  /**
   * Calculate overall risk level from findings
   */
  calculateRiskLevel(findings) {
    if (!findings || findings.length === 0) {
      return 'LOW';
    }

    const hasCritical = findings.some((f) => f.severity === 'critical');
    const hasHigh = findings.some((f) => f.severity === 'high');
    const mediumCount = findings.filter((f) => f.severity === 'medium').length;

    if (hasCritical) {
      return 'CRITICAL';
    }

    if (hasHigh) {
      return 'HIGH';
    }

    if (mediumCount >= 3) {
      return 'MEDIUM';
    }

    return 'LOW';
  }
}
