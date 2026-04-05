import assert from 'node:assert';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { applyYamlRules, loadYamlRules } from '../YamlRuleEngine.js';

const TMP_DIR = join(import.meta.dirname, '_tmp_yaml_test');
const RULES_DIR = join(TMP_DIR, '.mcp-shark', 'rules');

describe('YamlRuleEngine', () => {
  before(() => {
    mkdirSync(RULES_DIR, { recursive: true });
    writeFileSync(
      join(RULES_DIR, 'test-rule.yaml'),
      [
        'id: prod-keys',
        'name: No Production Keys',
        'severity: critical',
        'description: Detects production API keys',
        'message: "Production key in {key} on {server}"',
        'match:',
        '  env_pattern: "^PROD_"',
        '  value_pattern: "^sk-live"',
      ].join('\n')
    );
    writeFileSync(
      join(RULES_DIR, 'tool-rule.yml'),
      [
        'id: no-exec',
        'name: No Exec Tools',
        'severity: high',
        'description: Blocks exec tools',
        'match:',
        '  tool_pattern: "exec|run_command"',
      ].join('\n')
    );
  });

  after(() => {
    rmSync(TMP_DIR, { recursive: true, force: true });
  });

  describe('loadYamlRules', () => {
    it('loads .yaml and .yml files', () => {
      const rules = loadYamlRules(TMP_DIR);
      assert.strictEqual(rules.length, 2);
    });

    it('prefixes rule IDs with custom-', () => {
      const rules = loadYamlRules(TMP_DIR);
      assert.ok(rules.every((r) => r.id.startsWith('custom-')));
    });

    it('parses match conditions into regex', () => {
      const rules = loadYamlRules(TMP_DIR);
      const prodRule = rules.find((r) => r.id === 'custom-prod-keys');
      assert.ok(prodRule.match.envPattern instanceof RegExp);
      assert.ok(prodRule.match.valuePattern instanceof RegExp);
    });

    it('returns empty for nonexistent directory', () => {
      const rules = loadYamlRules('/nonexistent/path');
      assert.deepStrictEqual(rules, []);
    });
  });

  describe('applyYamlRules', () => {
    it('detects env var matching env_pattern + value_pattern', () => {
      const rules = loadYamlRules(TMP_DIR);
      const servers = [
        {
          name: 'prod-server',
          ide: 'Cursor',
          config: { env: { PROD_API_KEY: 'sk-live-abc123' } },
          tools: [],
        },
      ];
      const findings = applyYamlRules(rules, servers);
      assert.ok(findings.length > 0, 'Should detect production key');
      assert.strictEqual(findings[0].severity, 'critical');
      assert.ok(findings[0].description.includes('PROD_API_KEY'));
    });

    it('does not match when value_pattern fails', () => {
      const rules = loadYamlRules(TMP_DIR);
      const servers = [
        {
          name: 'safe-server',
          ide: 'Cursor',
          config: { env: { PROD_API_KEY: 'pk-test-abc' } },
          tools: [],
        },
      ];
      const findings = applyYamlRules(rules, servers);
      const prodFindings = findings.filter((f) => f.rule_id === 'custom-prod-keys');
      assert.strictEqual(prodFindings.length, 0);
    });

    it('detects tool matching tool_pattern', () => {
      const rules = loadYamlRules(TMP_DIR);
      const servers = [
        {
          name: 'dangerous-server',
          ide: 'Cursor',
          config: {},
          tools: [{ name: 'run_command' }, { name: 'read_file' }],
        },
      ];
      const findings = applyYamlRules(rules, servers);
      const execFindings = findings.filter((f) => f.rule_id === 'custom-no-exec');
      assert.strictEqual(execFindings.length, 1);
    });

    it('sets source to yaml-rule and confidence to advisory', () => {
      const rules = loadYamlRules(TMP_DIR);
      const servers = [
        {
          name: 'srv',
          ide: 'Cursor',
          config: {},
          tools: [{ name: 'exec_cmd' }],
        },
      ];
      const findings = applyYamlRules(rules, servers);
      assert.ok(findings.length > 0);
      assert.strictEqual(findings[0].source, 'yaml-rule');
      assert.strictEqual(findings[0].confidence, 'advisory');
    });
  });
});
