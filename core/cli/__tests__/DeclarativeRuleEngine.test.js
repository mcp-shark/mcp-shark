import assert from 'node:assert';
import { describe, it } from 'node:test';
import { loadDeclarativeRules } from '../DeclarativeRuleEngine.js';

describe('DeclarativeRuleEngine', () => {
  const rules = loadDeclarativeRules({ builtinOnly: true });

  it('loads exactly 24 declarative rules from built-in packs', () => {
    assert.strictEqual(rules.length, 24, `Expected 24 rules, got ${rules.length}`);
  });

  it('every rule has required metadata fields', () => {
    for (const rule of rules) {
      const meta = rule.ruleMetadata;
      assert.ok(meta.id, 'Rule missing id');
      assert.ok(meta.name, `Rule ${meta.id} missing name`);
      assert.ok(meta.severity, `Rule ${meta.id} missing severity`);
      assert.ok(meta.description, `Rule ${meta.id} missing description`);
    }
  });

  it('every rule has analyze functions', () => {
    for (const rule of rules) {
      assert.strictEqual(
        typeof rule.analyzeTool,
        'function',
        `${rule.ruleMetadata.id} missing analyzeTool`
      );
      assert.strictEqual(
        typeof rule.analyzePrompt,
        'function',
        `${rule.ruleMetadata.id} missing analyzePrompt`
      );
      assert.strictEqual(
        typeof rule.analyzeResource,
        'function',
        `${rule.ruleMetadata.id} missing analyzeResource`
      );
      assert.strictEqual(
        typeof rule.analyzePacket,
        'function',
        `${rule.ruleMetadata.id} missing analyzePacket`
      );
    }
  });

  it('analyzeTool returns findings for matching input', () => {
    const secretRule = rules.find((r) => r.ruleMetadata.id === 'hardcoded-secrets');
    assert.ok(secretRule, 'Should have hardcoded-secrets rule');
    const findings = secretRule.analyzeTool({
      name: 'leaky-tool',
      description: 'Uses AKIA1234567890ABCDEF to authenticate with AWS',
    });
    assert.ok(findings.length > 0, 'Should detect hardcoded secret pattern');
    assert.strictEqual(findings[0].target_type, 'tool');
  });

  it('analyzeTool returns empty for clean input', () => {
    const secretRule = rules.find((r) => r.ruleMetadata.id === 'hardcoded-secrets');
    assert.ok(secretRule);
    const findings = secretRule.analyzeTool({
      name: 'clean-tool',
      description: 'Formats JSON data nicely',
    });
    assert.strictEqual(findings.length, 0);
  });

  it('hardcoded-secrets Heroku pattern matches only with heroku context', () => {
    const secretRule = rules.find((r) => r.ruleMetadata.id === 'hardcoded-secrets');
    assert.ok(secretRule);
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const bareUuid = secretRule.analyzeTool({
      name: 't',
      description: `Correlation id ${uuid} in logs`,
    });
    const hasHerokuBare = bareUuid.some(
      (f) => f.title?.includes('Heroku') || f.description?.includes('Heroku')
    );
    assert.strictEqual(hasHerokuBare, false, 'Bare UUID should not match Heroku rule');

    const contextual = secretRule.analyzeTool({
      name: 't',
      description: `HEROKU_API_KEY=${uuid}`,
    });
    assert.ok(
      contextual.some((f) => f.title?.includes('Heroku') || f.description?.includes('Heroku')),
      'Expected Heroku API token finding when heroku prefix is present'
    );
  });

  it('respects exclude patterns', () => {
    const tokenRule = rules.find((r) => r.ruleMetadata.id === 'mcp01-token-mismanagement');
    assert.ok(tokenRule);
    const findings = tokenRule.analyzeTool({
      name: 'env-tool',
      description: 'Uses ${API_KEY} from environment',
    });
    assert.strictEqual(findings.length, 0, 'Should exclude env var references');
  });

  it('has rules from all three packs', () => {
    const ids = rules.map((r) => r.ruleMetadata.id);
    const hasMcp = ids.some((id) => id.startsWith('mcp'));
    const hasAsi = ids.some((id) => id.startsWith('asi'));
    const hasGeneral = ids.some((id) =>
      ['hardcoded-secrets', 'dns-rebinding', 'path-traversal', 'sensitive-data-exposure'].includes(
        id
      )
    );
    assert.ok(hasMcp, 'Should have OWASP MCP rules');
    assert.ok(hasAsi, 'Should have Agentic Security rules');
    assert.ok(hasGeneral, 'Should have General Security rules');
  });

  it('rule IDs are unique', () => {
    const ids = rules.map((r) => r.ruleMetadata.id);
    const unique = new Set(ids);
    assert.strictEqual(
      unique.size,
      ids.length,
      `Duplicate rule IDs: ${ids.filter((id, i) => ids.indexOf(id) !== i)}`
    );
  });
});
