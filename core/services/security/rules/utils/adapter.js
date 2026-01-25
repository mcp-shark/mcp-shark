/**
 * Adapter utilities to convert smart-scan findings to mcp-shark format
 */

/**
 * Convert a tool finding to mcp-shark format
 */
export function convertToolFinding(finding, ruleId, owaspId, recommendation) {
  return {
    rule_id: ruleId,
    severity: finding.severity || 'medium',
    owasp_id: owaspId,
    title: `${finding.issueType}: ${finding.name}`,
    description: finding.reasons?.join(' ') || finding.issueType,
    evidence: finding.name,
    recommendation: recommendation || finding.safeUseNotes || '',
    target_type: 'tool',
    target_name: finding.name,
  };
}

/**
 * Convert a resource finding to mcp-shark format
 */
export function convertResourceFinding(finding, ruleId, owaspId, recommendation) {
  return {
    rule_id: ruleId,
    severity: finding.severity || 'medium',
    owasp_id: owaspId,
    title: `${finding.issueType}: ${finding.uri || finding.name}`,
    description: finding.reasons?.join(' ') || finding.issueType,
    evidence: finding.uri || finding.name,
    recommendation: recommendation || finding.safeUseNotes || '',
    target_type: 'resource',
    target_name: finding.uri || finding.name,
  };
}

/**
 * Convert a prompt finding to mcp-shark format
 */
export function convertPromptFinding(finding, ruleId, owaspId, recommendation) {
  return {
    rule_id: ruleId,
    severity: finding.severity || 'medium',
    owasp_id: owaspId,
    title: `${finding.issueType}: ${finding.name}`,
    description: finding.reasons?.join(' ') || finding.issueType,
    evidence: finding.name,
    recommendation: recommendation || finding.safeUseNotes || '',
    target_type: 'prompt',
    target_name: finding.name,
  };
}

/**
 * Convert a packet finding to mcp-shark format
 */
export function convertPacketFinding(finding, ruleId, owaspId, recommendation, packet) {
  return {
    rule_id: ruleId,
    severity: finding.severity || 'medium',
    owasp_id: owaspId,
    title: finding.title || finding.issueType,
    description: finding.description || finding.reasons?.join(' ') || finding.issueType,
    evidence: finding.evidence || '',
    recommendation: recommendation || finding.safeUseNotes || '',
    target_type: 'packet',
    target_name: `frame_${packet?.frameNumber || 'unknown'}`,
  };
}

/**
 * Create wrapper functions for a scan function
 */
export function createRuleAdapter(scanFn, ruleId, owaspId, defaultRecommendation) {
  return {
    analyzeTool(tool) {
      const result = scanFn({ tools: [tool] });
      return result.toolFindings.map((f) =>
        convertToolFinding(f, ruleId, owaspId, defaultRecommendation)
      );
    },

    analyzePrompt(prompt) {
      const result = scanFn({ prompts: [prompt] });
      return result.promptFindings.map((f) =>
        convertPromptFinding(f, ruleId, owaspId, defaultRecommendation)
      );
    },

    analyzeResource(resource) {
      const result = scanFn({ resources: [resource] });
      return result.resourceFindings.map((f) =>
        convertResourceFinding(f, ruleId, owaspId, defaultRecommendation)
      );
    },

    analyzePacket(_packet) {
      // Default no-op - individual rules override this
      return [];
    },
  };
}
