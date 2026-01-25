/**
 * YARA Fallback Scanner
 * Provides regex-based pattern matching when native YARA is unavailable
 */

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extract meta information from YARA rule content
 */
function extractMeta(ruleContent) {
  const severity = ruleContent.match(/severity\s*=\s*"(\w+)"/)?.[1];
  const description = ruleContent.match(/description\s*=\s*"([^"]+)"/)?.[1];
  const owaspId = ruleContent.match(/owasp_id\s*=\s*"([^"]+)"/)?.[1];
  return { severity, description, owaspId };
}

/**
 * Extract regex patterns from YARA rule content
 */
export function extractPatterns(ruleContent) {
  if (!ruleContent) {
    return [];
  }

  const patterns = [];
  const meta = extractMeta(ruleContent);

  // Extract string patterns (simplified YARA pattern extraction)
  const stringMatches = ruleContent.matchAll(/\$\w+\s*=\s*(?:"([^"]+)"|\/([^/]+)\/)/g);
  for (const match of stringMatches) {
    const literal = match[1];
    const regexStr = match[2];

    try {
      if (literal) {
        patterns.push({
          name: literal.substring(0, 30),
          regex: new RegExp(escapeRegex(literal), 'i'),
          ...meta,
        });
      } else if (regexStr) {
        patterns.push({
          name: regexStr.substring(0, 30),
          regex: new RegExp(regexStr, 'i'),
          ...meta,
        });
      }
    } catch {
      // Invalid regex, skip
    }
  }

  return patterns;
}

/**
 * Perform fallback regex-based scan using loaded YARA rules
 */
export function fallbackScan(content, loadedRules, options = {}) {
  const findings = [];
  const { serverName, sessionId, targetType } = options;

  for (const [ruleId, ruleData] of loadedRules) {
    const patterns = extractPatterns(ruleData.content);
    for (const pattern of patterns) {
      if (pattern.regex.test(content)) {
        findings.push({
          rule_id: ruleId.startsWith('yara-') ? ruleId : `yara-${ruleId}`,
          finding_type: targetType === 'packet' ? 'traffic' : 'config',
          target_type: targetType,
          target_name: pattern.name || ruleId,
          server_name: serverName,
          session_id: sessionId,
          severity: pattern.severity || 'medium',
          title: pattern.description || `YARA: ${ruleId}`,
          description: pattern.description || `Pattern match: ${pattern.name}`,
          owasp_id: pattern.owaspId,
        });
        break; // One finding per rule
      }
    }
  }

  return findings;
}
