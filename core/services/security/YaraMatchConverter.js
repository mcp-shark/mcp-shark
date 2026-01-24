/**
 * YARA Match Converter
 * Converts YARA matches to security findings format
 */

/**
 * Extract severity from YARA rule metadata
 */
export function extractSeverity(meta) {
  if (!meta) {
    return 'medium';
  }
  const severity = meta.severity || meta.threat_level || meta.risk;
  if (severity) {
    const normalized = String(severity).toLowerCase();
    if (['critical', 'high', 'medium', 'low', 'info'].includes(normalized)) {
      return normalized;
    }
  }
  return 'medium';
}

/**
 * Extract OWASP ID from YARA rule metadata
 */
export function extractOwaspId(meta) {
  if (!meta) {
    return null;
  }
  return meta.owasp_id || meta.owasp || meta.cwe || null;
}

/**
 * Convert YARA matches to security findings format
 */
export function convertMatchesToFindings(matches, options) {
  const { serverName, sessionId, targetType } = options;

  return matches.map((match) => ({
    rule_id: `yara-${match.rule}`,
    finding_type: targetType === 'packet' ? 'traffic' : 'config',
    target_type: targetType,
    target_name: match.rule,
    server_name: serverName,
    session_id: sessionId,
    severity: extractSeverity(match.meta),
    owasp_id: extractOwaspId(match.meta),
    title: match.meta?.description || match.rule,
    description: match.meta?.reference || `YARA rule ${match.rule} matched`,
    evidence: match.strings?.map((s) => s.data?.toString()).join(', ') || null,
    recommendation: match.meta?.remediation || 'Review the matched content',
  }));
}

/**
 * Format YARA match for output
 */
export function formatMatch(match) {
  return {
    ruleId: match.rule,
    namespace: match.namespace,
    tags: match.tags || [],
    meta: match.meta || {},
    strings: match.strings || [],
  };
}
