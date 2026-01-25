import assert from 'node:assert';
import { describe, it } from 'node:test';
import { getAllRuleMetadata, getEnabledRules, getRule, staticRules } from '../index.js';

describe('rules/index', () => {
  describe('staticRules', () => {
    it('exports all rules', () => {
      assert.ok(typeof staticRules === 'object');
      // MCP OWASP Top 10
      assert.ok('mcp01-token-mismanagement' in staticRules);
      assert.ok('mcp03-tool-poisoning' in staticRules);
      assert.ok('mcp05-command-injection' in staticRules);
      assert.ok('mcp06-prompt-injection' in staticRules);
      assert.ok('mcp10-context-injection' in staticRules);
      // Agentic Security
      assert.ok('asi01-goal-hijack' in staticRules);
      assert.ok('asi05-rce' in staticRules);
      // General Security
      assert.ok('hardcoded-secrets' in staticRules);
      assert.ok('command-injection' in staticRules);
    });
  });

  describe('getAllRuleMetadata', () => {
    it('returns array of rule metadata', () => {
      const metadata = getAllRuleMetadata();
      assert.ok(Array.isArray(metadata));
      assert.ok(metadata.length >= 5);
    });

    it('each rule has required properties', () => {
      const metadata = getAllRuleMetadata();
      for (const rule of metadata) {
        assert.ok(rule.id, 'Rule should have id');
        assert.ok(rule.name, `Rule ${rule.id} should have name`);
        assert.ok(rule.owasp_id, `Rule ${rule.id} should have owasp_id`);
        assert.ok(rule.severity, `Rule ${rule.id} should have severity`);
      }
    });
  });

  describe('getRule', () => {
    it('returns rule for valid id', () => {
      const rule = getRule('mcp01-token-mismanagement');
      assert.ok(rule, 'Should return rule');
      assert.ok(typeof rule.analyzeTool === 'function');
      assert.ok(typeof rule.analyzePrompt === 'function');
      assert.ok(typeof rule.analyzeResource === 'function');
      assert.ok(typeof rule.analyzePacket === 'function');
    });

    it('returns null for invalid id', () => {
      const rule = getRule('nonexistent-rule');
      assert.strictEqual(rule, null);
    });
  });

  describe('getEnabledRules', () => {
    it('returns array of enabled rules', () => {
      const enabled = getEnabledRules();
      assert.ok(Array.isArray(enabled));
      // All rules should be enabled by default
      assert.ok(enabled.length >= 5);
    });

    it('enabled rules have analyze functions', () => {
      const enabled = getEnabledRules();
      for (const rule of enabled) {
        assert.ok(typeof rule.analyzeTool === 'function', `${rule.id} should have analyzeTool`);
        assert.ok(typeof rule.analyzePacket === 'function', `${rule.id} should have analyzePacket`);
      }
    });
  });
});
