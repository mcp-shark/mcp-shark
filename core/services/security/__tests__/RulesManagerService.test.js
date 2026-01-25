import assert from 'node:assert';
import { describe, it } from 'node:test';
import { RulesManagerService } from '../RulesManagerService.js';

/**
 * Create a mock rules repository
 */
function createMockRepository() {
  const rules = new Map();
  const sources = new Map();

  return {
    rules,
    sources,
    getRuleById(ruleId) {
      return rules.get(ruleId) || null;
    },
    getRules() {
      return Array.from(rules.values());
    },
    getEnabledRules() {
      return Array.from(rules.values()).filter((r) => r.enabled);
    },
    upsertRule(rule) {
      rules.set(rule.rule_id, { ...rule });
      return { changes: 1 };
    },
    deleteRule(ruleId) {
      const existed = rules.has(ruleId);
      rules.delete(ruleId);
      return { changes: existed ? 1 : 0 };
    },
    setRuleEnabled(ruleId, enabled) {
      const rule = rules.get(ruleId);
      if (rule) {
        rule.enabled = enabled;
        return { changes: 1 };
      }
      return { changes: 0 };
    },
    getSources() {
      return Array.from(sources.values());
    },
    upsertSource(source) {
      sources.set(source.name, source);
      return { changes: 1 };
    },
    deleteSource(name) {
      sources.delete(name);
      return { changes: 1 };
    },
    initializeDefaultSources() {
      return { success: true };
    },
    getSummary() {
      return { total: rules.size, enabled: this.getEnabledRules().length };
    },
  };
}

/**
 * Create a mock YARA engine
 */
function createMockYaraEngine() {
  return {
    loadedRules: [],
    async loadRules(rules) {
      this.loadedRules = rules;
      return rules.map((r) => ({ ruleId: r.id, success: true }));
    },
  };
}

describe('RulesManagerService', () => {
  describe('seedPredefinedRules', () => {
    it('seeds rules when not already present', () => {
      const repo = createMockRepository();
      const engine = createMockYaraEngine();
      const service = new RulesManagerService(repo, engine, null);

      const result = service.seedPredefinedRules();

      assert.ok(result.seeded > 0, 'Should seed some rules');
      assert.strictEqual(result.total, result.seeded, 'All rules should be seeded');
      assert.ok(repo.rules.size > 0, 'Repository should have rules');
    });

    it('skips existing rules', () => {
      const repo = createMockRepository();
      const engine = createMockYaraEngine();
      const service = new RulesManagerService(repo, engine, null);

      // Seed once
      const firstResult = service.seedPredefinedRules();

      // Seed again
      const secondResult = service.seedPredefinedRules();

      assert.strictEqual(secondResult.seeded, 0, 'No new rules should be seeded');
      assert.strictEqual(firstResult.total, secondResult.total, 'Total should be same');
    });
  });

  describe('resetPredefinedRules', () => {
    it('deletes and re-seeds all predefined rules', () => {
      const repo = createMockRepository();
      const engine = createMockYaraEngine();
      const service = new RulesManagerService(repo, engine, null);

      // Seed first
      service.seedPredefinedRules();
      const initialCount = repo.rules.size;

      // Modify a rule
      const firstRuleId = Array.from(repo.rules.keys())[0];
      repo.rules.get(firstRuleId).enabled = false;

      // Reset
      const result = service.resetPredefinedRules();

      assert.ok(result.deleted > 0, 'Should delete some rules');
      assert.strictEqual(result.reseeded, initialCount, 'Should reseed same count');
      assert.strictEqual(repo.rules.get(firstRuleId).enabled, true, 'Rule should be reset');
    });
  });

  describe('getRules and getEnabledRules', () => {
    it('getRules returns all rules', () => {
      const repo = createMockRepository();
      const engine = createMockYaraEngine();
      const service = new RulesManagerService(repo, engine, null);

      repo.upsertRule({ rule_id: 'rule1', enabled: true });
      repo.upsertRule({ rule_id: 'rule2', enabled: false });

      const rules = service.getRules();
      assert.strictEqual(rules.length, 2);
    });

    it('getEnabledRules returns only enabled rules', () => {
      const repo = createMockRepository();
      const engine = createMockYaraEngine();
      const service = new RulesManagerService(repo, engine, null);

      repo.upsertRule({ rule_id: 'rule1', enabled: true });
      repo.upsertRule({ rule_id: 'rule2', enabled: false });
      repo.upsertRule({ rule_id: 'rule3', enabled: true });

      const rules = service.getEnabledRules();
      assert.strictEqual(rules.length, 2);
    });
  });

  describe('setRuleEnabled', () => {
    it('toggles rule enabled state', () => {
      const repo = createMockRepository();
      const engine = createMockYaraEngine();
      const service = new RulesManagerService(repo, engine, null);

      repo.upsertRule({ rule_id: 'rule1', enabled: true });

      service.setRuleEnabled('rule1', false);
      assert.strictEqual(repo.rules.get('rule1').enabled, false);

      service.setRuleEnabled('rule1', true);
      assert.strictEqual(repo.rules.get('rule1').enabled, true);
    });
  });

  describe('saveRule', () => {
    it('saves valid custom rules', () => {
      const repo = createMockRepository();
      const engine = createMockYaraEngine();
      const service = new RulesManagerService(repo, engine, null);

      const result = service.saveRule({
        content: `rule test_rule {
          meta:
            description = "Test"
          strings:
            $a = "test"
          condition:
            any of them
        }`,
      });

      assert.strictEqual(result.success, true);
      assert.ok(result.rule.rule_id.includes('test_rule'));
    });

    it('rejects invalid YARA syntax', () => {
      const repo = createMockRepository();
      const engine = createMockYaraEngine();
      const service = new RulesManagerService(repo, engine, null);

      const result = service.saveRule({
        content: 'not valid yara syntax',
      });

      assert.strictEqual(result.success, false);
      assert.ok(result.errors.length > 0);
    });
  });

  describe('loadRulesIntoEngine', () => {
    it('loads enabled rules into YARA engine', async () => {
      const repo = createMockRepository();
      const engine = createMockYaraEngine();
      const service = new RulesManagerService(repo, engine, null);

      repo.upsertRule({ rule_id: 'rule1', content: 'content1', enabled: true });
      repo.upsertRule({ rule_id: 'rule2', content: 'content2', enabled: false });
      repo.upsertRule({ rule_id: 'rule3', content: 'content3', enabled: true });

      const result = await service.loadRulesIntoEngine();

      assert.strictEqual(result.loaded, 2);
      assert.strictEqual(result.failed, 0);
      assert.strictEqual(engine.loadedRules.length, 2);
    });

    it('returns zero counts for no enabled rules', async () => {
      const repo = createMockRepository();
      const engine = createMockYaraEngine();
      const service = new RulesManagerService(repo, engine, null);

      const result = await service.loadRulesIntoEngine();

      assert.strictEqual(result.loaded, 0);
      assert.strictEqual(result.failed, 0);
    });
  });
});
