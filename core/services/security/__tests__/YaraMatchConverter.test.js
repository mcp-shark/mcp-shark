import assert from 'node:assert';
import { describe, it } from 'node:test';
import {
  convertMatchesToFindings,
  extractOwaspId,
  extractSeverity,
  formatMatch,
} from '../YaraMatchConverter.js';

describe('YaraMatchConverter', () => {
  describe('extractSeverity', () => {
    it('returns medium for null meta', () => {
      assert.strictEqual(extractSeverity(null), 'medium');
    });

    it('returns medium for undefined meta', () => {
      assert.strictEqual(extractSeverity(undefined), 'medium');
    });

    it('returns medium for empty meta', () => {
      assert.strictEqual(extractSeverity({}), 'medium');
    });

    it('extracts severity from meta.severity', () => {
      assert.strictEqual(extractSeverity({ severity: 'critical' }), 'critical');
      assert.strictEqual(extractSeverity({ severity: 'high' }), 'high');
      assert.strictEqual(extractSeverity({ severity: 'medium' }), 'medium');
      assert.strictEqual(extractSeverity({ severity: 'low' }), 'low');
      assert.strictEqual(extractSeverity({ severity: 'info' }), 'info');
    });

    it('extracts severity from meta.threat_level', () => {
      assert.strictEqual(extractSeverity({ threat_level: 'critical' }), 'critical');
    });

    it('extracts severity from meta.risk', () => {
      assert.strictEqual(extractSeverity({ risk: 'high' }), 'high');
    });

    it('normalizes uppercase severity', () => {
      assert.strictEqual(extractSeverity({ severity: 'CRITICAL' }), 'critical');
      assert.strictEqual(extractSeverity({ severity: 'HIGH' }), 'high');
    });

    it('returns medium for unknown severity', () => {
      assert.strictEqual(extractSeverity({ severity: 'unknown' }), 'medium');
      assert.strictEqual(extractSeverity({ severity: 'extreme' }), 'medium');
    });
  });

  describe('extractOwaspId', () => {
    it('returns null for null meta', () => {
      assert.strictEqual(extractOwaspId(null), null);
    });

    it('returns null for undefined meta', () => {
      assert.strictEqual(extractOwaspId(undefined), null);
    });

    it('returns null for empty meta', () => {
      assert.strictEqual(extractOwaspId({}), null);
    });

    it('extracts owasp_id from meta', () => {
      assert.strictEqual(extractOwaspId({ owasp_id: 'MCP01' }), 'MCP01');
    });

    it('extracts owasp from meta', () => {
      assert.strictEqual(extractOwaspId({ owasp: 'MCP03' }), 'MCP03');
    });

    it('extracts cwe from meta', () => {
      assert.strictEqual(extractOwaspId({ cwe: 'CWE-79' }), 'CWE-79');
    });

    it('prioritizes owasp_id over owasp and cwe', () => {
      assert.strictEqual(
        extractOwaspId({ owasp_id: 'MCP01', owasp: 'MCP02', cwe: 'CWE-79' }),
        'MCP01'
      );
    });
  });

  describe('convertMatchesToFindings', () => {
    it('converts empty matches array', () => {
      const result = convertMatchesToFindings([], {
        serverName: 'test',
        sessionId: 's1',
        targetType: 'packet',
      });
      assert.deepStrictEqual(result, []);
    });

    it('converts single match to finding', () => {
      const matches = [
        {
          rule: 'test_rule',
          meta: { description: 'Test description', severity: 'high', owasp_id: 'MCP01' },
          strings: [],
        },
      ];
      const result = convertMatchesToFindings(matches, {
        serverName: 'my-server',
        sessionId: 'session-123',
        targetType: 'packet',
      });

      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].rule_id, 'yara-test_rule');
      assert.strictEqual(result[0].finding_type, 'traffic');
      assert.strictEqual(result[0].target_type, 'packet');
      assert.strictEqual(result[0].server_name, 'my-server');
      assert.strictEqual(result[0].session_id, 'session-123');
      assert.strictEqual(result[0].severity, 'high');
      assert.strictEqual(result[0].owasp_id, 'MCP01');
      assert.strictEqual(result[0].title, 'Test description');
    });

    it('uses rule name as title when no description', () => {
      const matches = [{ rule: 'my_rule', meta: {} }];
      const result = convertMatchesToFindings(matches, { targetType: 'packet' });
      assert.strictEqual(result[0].title, 'my_rule');
    });

    it('uses default description when no reference', () => {
      const matches = [{ rule: 'my_rule', meta: {} }];
      const result = convertMatchesToFindings(matches, { targetType: 'packet' });
      assert.strictEqual(result[0].description, 'YARA rule my_rule matched');
    });

    it('extracts evidence from strings', () => {
      const matches = [
        {
          rule: 'test_rule',
          meta: {},
          strings: [{ data: Buffer.from('match1') }, { data: Buffer.from('match2') }],
        },
      ];
      const result = convertMatchesToFindings(matches, { targetType: 'packet' });
      assert.strictEqual(result[0].evidence, 'match1, match2');
    });

    it('handles null strings', () => {
      const matches = [{ rule: 'test_rule', meta: {}, strings: null }];
      const result = convertMatchesToFindings(matches, { targetType: 'packet' });
      assert.strictEqual(result[0].evidence, null);
    });

    it('sets finding_type to config for non-packet target', () => {
      const matches = [{ rule: 'test_rule', meta: {} }];
      const result = convertMatchesToFindings(matches, { targetType: 'tool' });
      assert.strictEqual(result[0].finding_type, 'config');
    });

    it('uses remediation from meta', () => {
      const matches = [{ rule: 'test_rule', meta: { remediation: 'Fix this issue' } }];
      const result = convertMatchesToFindings(matches, { targetType: 'packet' });
      assert.strictEqual(result[0].recommendation, 'Fix this issue');
    });

    it('converts multiple matches', () => {
      const matches = [
        { rule: 'rule1', meta: { severity: 'high' } },
        { rule: 'rule2', meta: { severity: 'low' } },
      ];
      const result = convertMatchesToFindings(matches, { targetType: 'packet' });
      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].rule_id, 'yara-rule1');
      assert.strictEqual(result[1].rule_id, 'yara-rule2');
    });
  });

  describe('formatMatch', () => {
    it('formats match with all fields', () => {
      const match = {
        rule: 'test_rule',
        namespace: 'default',
        tags: ['malware', 'suspicious'],
        meta: { author: 'test' },
        strings: [{ identifier: '$a', data: 'test' }],
      };
      const result = formatMatch(match);

      assert.strictEqual(result.ruleId, 'test_rule');
      assert.strictEqual(result.namespace, 'default');
      assert.deepStrictEqual(result.tags, ['malware', 'suspicious']);
      assert.deepStrictEqual(result.meta, { author: 'test' });
      assert.strictEqual(result.strings.length, 1);
    });

    it('provides defaults for missing fields', () => {
      const match = { rule: 'minimal_rule' };
      const result = formatMatch(match);

      assert.strictEqual(result.ruleId, 'minimal_rule');
      assert.deepStrictEqual(result.tags, []);
      assert.deepStrictEqual(result.meta, {});
      assert.deepStrictEqual(result.strings, []);
    });

    it('handles null tags', () => {
      const match = { rule: 'test', tags: null };
      const result = formatMatch(match);
      assert.deepStrictEqual(result.tags, []);
    });

    it('handles null meta', () => {
      const match = { rule: 'test', meta: null };
      const result = formatMatch(match);
      assert.deepStrictEqual(result.meta, {});
    });

    it('handles null strings', () => {
      const match = { rule: 'test', strings: null };
      const result = formatMatch(match);
      assert.deepStrictEqual(result.strings, []);
    });
  });
});
