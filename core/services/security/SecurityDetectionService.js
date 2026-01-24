/**
 * Security Detection Service
 * Main orchestrator for security vulnerability detection
 * Combines static rules, config analysis, and traffic analysis
 */
import { randomUUID } from 'node:crypto';

export class SecurityDetectionService {
  constructor(staticRulesService, securityFindingsRepository, logger) {
    this.staticRulesService = staticRulesService;
    this.findingsRepository = securityFindingsRepository;
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
  scanServerConfig(serverConfig) {
    const scanId = randomUUID();
    const findings = this.staticRulesService.analyzeServerConfig(serverConfig);

    // Store findings
    if (findings.length > 0) {
      this.findingsRepository.insertFindings(findings, scanId);
      this.logger?.info(
        { serverName: serverConfig.name, findingsCount: findings.length, scanId },
        'Security scan completed'
      );
    }

    return {
      scanId,
      serverName: serverConfig.name,
      findingsCount: findings.length,
      findings,
      summary: this.staticRulesService.summarizeFindings(findings),
    };
  }

  /**
   * Scan multiple MCP servers
   */
  scanMultipleServers(servers) {
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
      allFindings.push(...findings);
      results.push({
        serverName: server.name,
        findingsCount: findings.length,
        summary: this.staticRulesService.summarizeFindings(findings),
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
  analyzePacket(packet, sessionId = null) {
    const findings = this.staticRulesService.analyzePacket(packet, sessionId);

    // Store findings immediately for real-time traffic
    if (findings.length > 0) {
      this.findingsRepository.insertFindings(findings);
      this.logger?.debug(
        { frameNumber: packet.frameNumber, findingsCount: findings.length },
        'Security findings in packet'
      );
    }

    return findings;
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
