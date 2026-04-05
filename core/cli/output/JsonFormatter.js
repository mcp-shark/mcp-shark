/**
 * JSON and SARIF output formatters for scan results
 */

/**
 * Format scan results as JSON
 */
export function formatAsJson(scanResult) {
  return JSON.stringify(scanResult, null, 2);
}

/**
 * Format scan results as SARIF v2.1.0
 * Static Analysis Results Interchange Format for CI/CD integration
 */
export function formatAsSarif(scanResult) {
  const sarifRules = buildSarifRules(scanResult.findings);
  const sarifResults = buildSarifResults(scanResult.findings);

  const sarif = {
    $schema:
      'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/main/sarif-2.1/schema/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'mcp-shark',
            version: scanResult.version || '1.0.0',
            informationUri: 'https://mcpshark.sh',
            rules: sarifRules,
          },
        },
        results: sarifResults,
      },
    ],
  };

  return JSON.stringify(sarif, null, 2);
}

/**
 * Build SARIF rule descriptors from findings
 */
function buildSarifRules(findings) {
  const ruleMap = new Map();

  for (const finding of findings) {
    const ruleId = finding.rule_id || finding.category || 'unknown';
    if (ruleMap.has(ruleId)) {
      continue;
    }

    ruleMap.set(ruleId, {
      id: ruleId,
      name: finding.title || ruleId,
      shortDescription: {
        text: finding.title || finding.description || ruleId,
      },
      defaultConfiguration: {
        level: mapSeverityToSarif(finding.severity || finding.risk_level),
      },
    });
  }

  return [...ruleMap.values()];
}

/**
 * Build SARIF result entries from findings
 */
function buildSarifResults(findings) {
  return findings.map((finding) => ({
    ruleId: finding.rule_id || finding.category || 'unknown',
    level: mapSeverityToSarif(finding.severity || finding.risk_level),
    message: {
      text: finding.description || finding.title || finding.message || '',
    },
    locations: [
      {
        physicalLocation: {
          artifactLocation: {
            uri: finding.config_path || finding.server_name || 'unknown',
          },
        },
      },
    ],
    properties: {
      confidence: finding.confidence || 'probable',
      serverName: finding.server_name || null,
    },
  }));
}

/**
 * Map internal severity to SARIF level
 */
function mapSeverityToSarif(severity) {
  const map = {
    critical: 'error',
    high: 'error',
    medium: 'warning',
    low: 'note',
  };
  return map[(severity || '').toLowerCase()] || 'warning';
}
