import assert from 'node:assert';
import { describe, it } from 'node:test';
import { PREDEFINED_YARA_RULES, getPredefinedRules } from '../predefinedYaraRules.js';

describe('predefinedYaraRules', () => {
  describe('PREDEFINED_YARA_RULES', () => {
    it('is a non-empty array', () => {
      assert.ok(Array.isArray(PREDEFINED_YARA_RULES));
      assert.ok(PREDEFINED_YARA_RULES.length > 0);
    });

    it('each rule has name and content', () => {
      PREDEFINED_YARA_RULES.forEach((rule, index) => {
        assert.ok(rule.name, `Rule ${index} should have name`);
        assert.ok(rule.content, `Rule ${index} should have content`);
      });
    });

    it('each rule content is valid YARA syntax', () => {
      PREDEFINED_YARA_RULES.forEach((rule) => {
        assert.ok(
          rule.content.includes('rule '),
          `Rule ${rule.name} should contain 'rule' keyword`
        );
        assert.ok(rule.content.includes('meta:'), `Rule ${rule.name} should contain meta section`);
        assert.ok(
          rule.content.includes('strings:'),
          `Rule ${rule.name} should contain strings section`
        );
        assert.ok(
          rule.content.includes('condition:'),
          `Rule ${rule.name} should contain condition section`
        );
      });
    });

    it('each rule has severity in meta', () => {
      PREDEFINED_YARA_RULES.forEach((rule) => {
        assert.ok(
          rule.content.includes('severity = '),
          `Rule ${rule.name} should have severity in meta`
        );
      });
    });

    it('each rule has owasp_id in meta', () => {
      PREDEFINED_YARA_RULES.forEach((rule) => {
        assert.ok(
          rule.content.includes('owasp_id = '),
          `Rule ${rule.name} should have owasp_id in meta`
        );
      });
    });
  });

  describe('getPredefinedRules', () => {
    it('returns array of formatted rules', () => {
      const rules = getPredefinedRules();
      assert.ok(Array.isArray(rules));
      assert.strictEqual(rules.length, PREDEFINED_YARA_RULES.length);
    });

    it('all rules have required fields', () => {
      const rules = getPredefinedRules();
      rules.forEach((rule, index) => {
        assert.ok(rule.rule_id, `Rule ${index} should have rule_id`);
        assert.ok(rule.name, `Rule ${index} should have name`);
        assert.ok(rule.content, `Rule ${index} should have content`);
        assert.ok(rule.source, `Rule ${index} should have source`);
        assert.ok(typeof rule.enabled === 'boolean', `Rule ${index} should have enabled boolean`);
      });
    });

    it('all rule_ids are prefixed with yara-', () => {
      const rules = getPredefinedRules();
      rules.forEach((rule) => {
        assert.ok(
          rule.rule_id.startsWith('yara-'),
          `Rule ${rule.rule_id} should start with 'yara-'`
        );
      });
    });

    it('all rules have source set to predefined', () => {
      const rules = getPredefinedRules();
      rules.forEach((rule) => {
        assert.strictEqual(rule.source, 'predefined');
      });
    });

    it('all rules are enabled by default', () => {
      const rules = getPredefinedRules();
      rules.forEach((rule) => {
        assert.strictEqual(rule.enabled, true);
      });
    });

    it('rule_id matches name with yara- prefix', () => {
      const rules = getPredefinedRules();
      rules.forEach((rule) => {
        assert.strictEqual(rule.rule_id, `yara-${rule.name}`);
      });
    });
  });
});
