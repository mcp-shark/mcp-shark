import assert from 'node:assert';
import { describe, it } from 'node:test';
import { extractPatterns, fallbackScan } from '../YaraFallbackScanner.js';

describe('YaraFallbackScanner', () => {
  describe('extractPatterns', () => {
    it('returns empty array for null content', () => {
      assert.deepStrictEqual(extractPatterns(null), []);
    });

    it('returns empty array for undefined content', () => {
      assert.deepStrictEqual(extractPatterns(undefined), []);
    });

    it('returns empty array for empty string', () => {
      assert.deepStrictEqual(extractPatterns(''), []);
    });

    it('extracts string literals from YARA rules', () => {
      const ruleContent = `rule test_rule {
        strings:
          $a = "suspicious_pattern"
        condition:
          any of them
      }`;

      const patterns = extractPatterns(ruleContent);
      assert.strictEqual(patterns.length, 1);
      assert.strictEqual(patterns[0].name, 'suspicious_pattern');
      assert.ok(patterns[0].regex instanceof RegExp);
      assert.ok(patterns[0].regex.test('suspicious_pattern'));
    });

    it('extracts regex patterns from YARA rules', () => {
      const ruleContent = `rule test_rule {
        strings:
          $key = /sk-[a-zA-Z0-9]{10,}/
        condition:
          any of them
      }`;

      const patterns = extractPatterns(ruleContent);
      assert.strictEqual(patterns.length, 1);
      assert.ok(patterns[0].regex.test('sk-abcdefghij123'));
    });

    it('extracts meta information from YARA rules', () => {
      const ruleContent = `rule test_rule {
        meta:
          description = "Test rule description"
          severity = "high"
          owasp_id = "MCP01"
        strings:
          $a = "test"
        condition:
          any of them
      }`;

      const patterns = extractPatterns(ruleContent);
      assert.strictEqual(patterns.length, 1);
      assert.strictEqual(patterns[0].severity, 'high');
      assert.strictEqual(patterns[0].description, 'Test rule description');
      assert.strictEqual(patterns[0].owaspId, 'MCP01');
    });

    it('extracts multiple patterns from single rule', () => {
      const ruleContent = `rule test_rule {
        strings:
          $a = "pattern_one"
          $b = "pattern_two"
        condition:
          any of them
      }`;

      const patterns = extractPatterns(ruleContent);
      assert.strictEqual(patterns.length, 2);
    });

    it('handles invalid regex gracefully', () => {
      const ruleContent = `rule test_rule {
        strings:
          $valid = "valid_pattern"
          $invalid = /[invalid(/
        condition:
          any of them
      }`;

      const patterns = extractPatterns(ruleContent);
      assert.strictEqual(patterns.length, 1);
      assert.strictEqual(patterns[0].name, 'valid_pattern');
    });
  });

  describe('fallbackScan', () => {
    const createLoadedRules = (rules) => {
      const map = new Map();
      for (const [id, content] of Object.entries(rules)) {
        map.set(id, { content });
      }
      return map;
    };

    it('returns empty array for no matches', () => {
      const loadedRules = createLoadedRules({
        'yara-test': `rule test { strings: $a = "notfound" condition: any of them }`,
      });

      const findings = fallbackScan('some content', loadedRules);
      assert.deepStrictEqual(findings, []);
    });

    it('returns findings for matching patterns', () => {
      const loadedRules = createLoadedRules({
        'yara-test': `rule test { strings: $a = "secret" condition: any of them }`,
      });

      const findings = fallbackScan('this contains secret data', loadedRules);
      assert.strictEqual(findings.length, 1);
    });

    it('sets correct rule_id prefix for non-prefixed rules', () => {
      const loadedRules = createLoadedRules({
        'test-rule': `rule test { strings: $a = "match" condition: any of them }`,
      });

      const findings = fallbackScan('match this', loadedRules);
      assert.strictEqual(findings[0].rule_id, 'yara-test-rule');
    });

    it('preserves existing yara- prefix', () => {
      const loadedRules = createLoadedRules({
        'yara-existing': `rule test { strings: $a = "match" condition: any of them }`,
      });

      const findings = fallbackScan('match this', loadedRules);
      assert.strictEqual(findings[0].rule_id, 'yara-existing');
    });

    it('includes severity and owasp_id from rule meta', () => {
      const loadedRules = createLoadedRules({
        'yara-test': `rule test {
          meta:
            severity = "critical"
            owasp_id = "MCP05"
          strings:
            $a = "injection"
          condition:
            any of them
        }`,
      });

      const findings = fallbackScan('sql injection attack', loadedRules);
      assert.strictEqual(findings[0].severity, 'critical');
      assert.strictEqual(findings[0].owasp_id, 'MCP05');
    });

    it('sets correct finding_type based on targetType', () => {
      const loadedRules = createLoadedRules({
        'yara-test': `rule test { strings: $a = "test" condition: any of them }`,
      });

      const packetFindings = fallbackScan('test', loadedRules, { targetType: 'packet' });
      assert.strictEqual(packetFindings[0].finding_type, 'traffic');

      const configFindings = fallbackScan('test', loadedRules, { targetType: 'tool' });
      assert.strictEqual(configFindings[0].finding_type, 'config');
    });

    it('includes serverName and sessionId in findings', () => {
      const loadedRules = createLoadedRules({
        'yara-test': `rule test { strings: $a = "test" condition: any of them }`,
      });

      const findings = fallbackScan('test', loadedRules, {
        serverName: 'my-server',
        sessionId: 'session-123',
      });

      assert.strictEqual(findings[0].server_name, 'my-server');
      assert.strictEqual(findings[0].session_id, 'session-123');
    });

    it('produces one finding per rule (first match only)', () => {
      const loadedRules = createLoadedRules({
        'yara-test': `rule test {
          strings:
            $a = "match1"
            $b = "match2"
          condition:
            any of them
        }`,
      });

      const findings = fallbackScan('match1 and match2 in content', loadedRules);
      assert.strictEqual(findings.length, 1);
    });
  });
});
