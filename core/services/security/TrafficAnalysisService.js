/**
 * Traffic Analysis Service
 * Analyzes MCP traffic in real-time for security vulnerabilities
 * Hooks into the audit logging pipeline
 */
export class TrafficAnalysisService {
  constructor(staticRulesService, securityFindingsRepository, logger) {
    this.staticRulesService = staticRulesService;
    this.findingsRepository = securityFindingsRepository;
    this.logger = logger;
    this.enabled = true;
  }

  /**
   * Enable or disable real-time traffic analysis
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Check if traffic analysis is enabled
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Analyze a request packet for security issues
   * Called after the request is logged
   */
  analyzeRequest(packetData) {
    if (!this.enabled) {
      return [];
    }

    try {
      const packet = {
        frameNumber: packetData.frameNumber,
        body: packetData.body,
        direction: 'request',
      };

      const findings = this.staticRulesService.analyzePacket(packet, packetData.sessionId);

      if (findings.length > 0) {
        this.findingsRepository.insertFindings(findings);
        this.logger?.debug(
          { frameNumber: packetData.frameNumber, count: findings.length },
          'Security findings in request'
        );
      }

      return findings;
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Error analyzing request packet');
      return [];
    }
  }

  /**
   * Analyze a response packet for security issues
   * Called after the response is logged
   */
  analyzeResponse(packetData) {
    if (!this.enabled) {
      return [];
    }

    try {
      const packet = {
        frameNumber: packetData.frameNumber,
        body: packetData.body,
        direction: 'response',
      };

      const findings = this.staticRulesService.analyzePacket(packet, packetData.sessionId);

      if (findings.length > 0) {
        this.findingsRepository.insertFindings(findings);
        this.logger?.debug(
          { frameNumber: packetData.frameNumber, count: findings.length },
          'Security findings in response'
        );
      }

      return findings;
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Error analyzing response packet');
      return [];
    }
  }

  /**
   * Get analysis statistics
   */
  getStats() {
    return {
      enabled: this.enabled,
      // Could add more stats like packets analyzed, findings found, etc.
    };
  }
}
