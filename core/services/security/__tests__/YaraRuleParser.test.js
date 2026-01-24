import assert from 'node:assert';
import { describe, it } from 'node:test';
import {
  convertToSecurityRule,
  getRuleSummary,
  parseYaraFile,
  parseYaraRule,
  validateYaraRule,
} from '../YaraRuleParser.js';

describe('YaraRuleParser', () => {
  const sampleRule = `
rule test_rule : tag1 tag2 {
  meta:
    description = "Test rule description"
    author = "Test Author"
    severity = "high"
    owasp_id = "MCP01"
  strings:
    $a = "test string"
    $b = /test[0-9]+/
  condition:
    any of them
}
`;

  describe('parseYaraRule', () => {
    it('parses rule name', () => {
      const result = parseYaraRule(sampleRule);
      assert.strictEqual(result.name, 'test_rule');
      assert.strictEqual(result.valid, true);
    });

    it('parses rule tags', () => {
      const result = parseYaraRule(sampleRule);
      assert.deepStrictEqual(result.tags, ['tag1', 'tag2']);
    });

    it('parses meta section', () => {
      const result = parseYaraRule(sampleRule);
      assert.strictEqual(result.meta.description, 'Test rule description');
      assert.strictEqual(result.meta.author, 'Test Author');
      assert.strictEqual(result.meta.severity, 'high');
      assert.strictEqual(result.meta.owasp_id, 'MCP01');
    });

    it('parses strings section', () => {
      const result = parseYaraRule(sampleRule);
      assert.ok(result.strings.length >= 1);
      assert.strictEqual(result.strings[0].identifier, '$a');
    });

    it('parses condition', () => {
      const result = parseYaraRule(sampleRule);
      assert.ok(result.condition.includes('any of them'));
    });

    it('handles rule without tags', () => {
      const ruleWithoutTags = `
rule simple_rule {
  condition:
    true
}
`;
      const result = parseYaraRule(ruleWithoutTags);
      assert.strictEqual(result.name, 'simple_rule');
      assert.deepStrictEqual(result.tags, []);
    });

    it('returns invalid for malformed rule', () => {
      const result = parseYaraRule('not a valid rule');
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.length > 0);
    });
  });

  describe('parseYaraFile', () => {
    it('parses multiple rules from file content', () => {
      const content = `
rule rule1 {
  condition:
    true
}

rule rule2 {
  condition:
    false
}
`;
      const rules = parseYaraFile(content);
      assert.ok(rules.length >= 1);
    });
  });

  describe('convertToSecurityRule', () => {
    it('converts parsed rule to security rule format', () => {
      const parsed = parseYaraRule(sampleRule);
      const securityRule = convertToSecurityRule(parsed, 'test-source');

      assert.strictEqual(securityRule.rule_id, 'yara-test_rule');
      assert.strictEqual(securityRule.source, 'test-source');
      assert.strictEqual(securityRule.severity, 'high');
      assert.strictEqual(securityRule.owasp_id, 'MCP01');
    });

    it('normalizes severity values', () => {
      const parsed = {
        name: 'test',
        meta: { severity: 'CRITICAL' },
        tags: [],
      };
      const securityRule = convertToSecurityRule(parsed);
      assert.strictEqual(securityRule.severity, 'critical');
    });

    it('defaults to medium severity when not specified', () => {
      const parsed = {
        name: 'test',
        meta: {},
        tags: [],
      };
      const securityRule = convertToSecurityRule(parsed);
      assert.strictEqual(securityRule.severity, 'medium');
    });
  });

  describe('validateYaraRule', () => {
    it('validates correct rule', () => {
      const result = validateYaraRule(sampleRule);
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.errors.length, 0);
    });

    it('detects missing rule declaration', () => {
      const result = validateYaraRule('condition: true');
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some((e) => e.includes('rule declaration')));
    });

    it('detects missing condition', () => {
      const result = validateYaraRule('rule test { meta: description = "test" }');
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some((e) => e.includes('condition')));
    });

    it('detects unbalanced braces', () => {
      const result = validateYaraRule('rule test { condition: true');
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some((e) => e.includes('braces')));
    });
  });

  describe('getRuleSummary', () => {
    it('returns summary of parsed rule', () => {
      const parsed = parseYaraRule(sampleRule);
      const summary = getRuleSummary(parsed);

      assert.strictEqual(summary.name, 'test_rule');
      assert.deepStrictEqual(summary.tags, ['tag1', 'tag2']);
      assert.strictEqual(summary.description, 'Test rule description');
      assert.strictEqual(summary.author, 'Test Author');
      assert.strictEqual(summary.severity, 'high');
      assert.strictEqual(summary.hasCondition, true);
    });
  });
});
