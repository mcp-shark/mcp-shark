import assert from 'node:assert';
import { describe, it } from 'node:test';
import { formatAsJson, formatAsSarif } from '../JsonFormatter.js';

describe('JsonFormatter', () => {
  const mockResult = {
    version: '1.5.13',
    findings: [
      {
        rule_id: 'hardcoded-secret',
        severity: 'critical',
        title: 'API Key Hardcoded',
        description: 'Found sk-abc in config',
        server_name: 'test-server',
        config_path: '/home/user/.cursor/mcp.json',
        confidence: 'definite',
      },
      {
        rule_id: 'missing-containment',
        severity: 'high',
        title: 'No Docker Container',
        description: 'Server runs without containment',
        server_name: 'test-server',
      },
    ],
    score: { score: 60, grade: 'C' },
  };

  describe('formatAsJson', () => {
    it('returns valid JSON', () => {
      const json = formatAsJson(mockResult);
      const parsed = JSON.parse(json);
      assert.strictEqual(parsed.version, '1.5.13');
      assert.strictEqual(parsed.findings.length, 2);
    });

    it('preserves all finding fields', () => {
      const parsed = JSON.parse(formatAsJson(mockResult));
      assert.strictEqual(parsed.findings[0].rule_id, 'hardcoded-secret');
      assert.strictEqual(parsed.findings[0].severity, 'critical');
    });
  });

  describe('formatAsSarif', () => {
    it('produces SARIF v2.1.0', () => {
      const sarif = JSON.parse(formatAsSarif(mockResult));
      assert.strictEqual(sarif.version, '2.1.0');
      assert.ok(sarif.$schema.includes('sarif-schema-2.1.0'));
    });

    it('has exactly one run', () => {
      const sarif = JSON.parse(formatAsSarif(mockResult));
      assert.strictEqual(sarif.runs.length, 1);
    });

    it('driver is mcp-shark', () => {
      const sarif = JSON.parse(formatAsSarif(mockResult));
      assert.strictEqual(sarif.runs[0].tool.driver.name, 'mcp-shark');
      assert.strictEqual(sarif.runs[0].tool.driver.version, '1.5.13');
    });

    it('maps critical/high to error, medium to warning, low to note', () => {
      const sarif = JSON.parse(formatAsSarif(mockResult));
      const results = sarif.runs[0].results;
      assert.strictEqual(results[0].level, 'error');
      assert.strictEqual(results[1].level, 'error');
    });

    it('includes correct number of results', () => {
      const sarif = JSON.parse(formatAsSarif(mockResult));
      assert.strictEqual(sarif.runs[0].results.length, 2);
    });

    it('deduplicates rules', () => {
      const sarif = JSON.parse(formatAsSarif(mockResult));
      const ruleIds = sarif.runs[0].tool.driver.rules.map((r) => r.id);
      const unique = new Set(ruleIds);
      assert.strictEqual(unique.size, ruleIds.length);
    });

    it('includes artifact locations', () => {
      const sarif = JSON.parse(formatAsSarif(mockResult));
      const loc = sarif.runs[0].results[0].locations[0].physicalLocation.artifactLocation;
      assert.strictEqual(loc.uri, '/home/user/.cursor/mcp.json');
    });

    it('maps medium severity to warning', () => {
      const result = {
        version: '1.0.0',
        findings: [{ severity: 'medium', rule_id: 'test', title: 'Test', description: 'Test' }],
      };
      const sarif = JSON.parse(formatAsSarif(result));
      assert.strictEqual(sarif.runs[0].results[0].level, 'warning');
    });

    it('maps low severity to note', () => {
      const result = {
        version: '1.0.0',
        findings: [{ severity: 'low', rule_id: 'test', title: 'Test', description: 'Test' }],
      };
      const sarif = JSON.parse(formatAsSarif(result));
      assert.strictEqual(sarif.runs[0].results[0].level, 'note');
    });
  });
});
