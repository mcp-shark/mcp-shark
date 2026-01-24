import assert from 'node:assert';
import { before, describe, it } from 'node:test';
import { StaticRulesService } from '../StaticRulesService.js';
import { YaraEngineService } from '../YaraEngineService.js';

/**
 * Creates test fixtures for YaraEngineService tests
 */
function createTestFixtures() {
  const staticRulesService = new StaticRulesService(null);
  const service = new YaraEngineService(staticRulesService, null);
  return { staticRulesService, service };
}

describe('YaraEngineService', () => {
  const fixtures = createTestFixtures();

  before(async () => {
    await fixtures.service.initialize();
  });

  describe('isNativeAvailable', () => {
    it('returns boolean', () => {
      const result = fixtures.service.isNativeAvailable();
      assert.strictEqual(typeof result, 'boolean');
    });
  });

  describe('getNativeError', () => {
    it('returns null or string', () => {
      const result = fixtures.service.getNativeError();
      assert.ok(result === null || typeof result === 'string');
    });
  });

  describe('getStatus', () => {
    it('returns status object with all fields', () => {
      const status = fixtures.service.getStatus();
      assert.ok(typeof status === 'object');
      assert.ok('initialized' in status);
      assert.ok('nativeAvailable' in status);
      assert.ok('nativeError' in status);
      assert.ok('loadedRulesCount' in status);
      assert.ok('compiledRulesCount' in status);
    });

    it('returns correct types for all fields', () => {
      const status = fixtures.service.getStatus();
      assert.strictEqual(typeof status.initialized, 'boolean');
      assert.strictEqual(typeof status.nativeAvailable, 'boolean');
      assert.strictEqual(typeof status.loadedRulesCount, 'number');
      assert.strictEqual(typeof status.compiledRulesCount, 'number');
    });
  });

  describe('initialize', () => {
    it('initializes successfully', async () => {
      const result = await fixtures.service.initialize();
      assert.strictEqual(result.success, true);
    });

    it('returns consistent status after init', async () => {
      await fixtures.service.initialize();
      const status = fixtures.service.getStatus();
      assert.strictEqual(status.initialized, true);
    });

    it('returns same result on repeated initialization', async () => {
      const result1 = await fixtures.service.initialize();
      const result2 = await fixtures.service.initialize();
      assert.strictEqual(result1.success, result2.success);
    });

    it('indicates mode in result', async () => {
      const result = await fixtures.service.initialize();
      assert.ok('native' in result);
      assert.strictEqual(typeof result.native, 'boolean');
    });
  });

  describe('loadRule', () => {
    it('stores rule content', async () => {
      const result = await fixtures.service.loadRule('test-rule', 'rule test { condition: true }');
      assert.strictEqual(result.success, true);
    });

    it('increments loaded rules count', async () => {
      await fixtures.service.clearRules();
      const before = fixtures.service.getStatus().loadedRulesCount;
      await fixtures.service.loadRule('new-rule', 'rule new { condition: true }');
      const after = fixtures.service.getStatus().loadedRulesCount;
      assert.strictEqual(after, before + 1);
    });

    it('indicates native status', async () => {
      const result = await fixtures.service.loadRule(
        'test-rule-2',
        'rule test2 { condition: true }'
      );
      assert.ok('native' in result);
      assert.strictEqual(typeof result.native, 'boolean');
    });
  });

  describe('loadRules', () => {
    it('loads multiple rules', async () => {
      const rules = [
        { id: 'rule-a', content: 'rule a { condition: true }' },
        { id: 'rule-b', content: 'rule b { condition: true }' },
      ];
      const results = await fixtures.service.loadRules(rules);
      assert.strictEqual(results.length, 2);
      assert.ok(results.every((r) => r.success === true));
    });

    it('returns ruleId for each result', async () => {
      const rules = [{ id: 'rule-x', content: 'rule x { condition: true }' }];
      const results = await fixtures.service.loadRules(rules);
      assert.strictEqual(results[0].ruleId, 'rule-x');
    });
  });

  describe('clearRules', () => {
    it('clears loaded rules', async () => {
      await fixtures.service.loadRule('test', 'rule test { condition: true }');
      await fixtures.service.clearRules();
      const status = fixtures.service.getStatus();
      assert.strictEqual(status.loadedRulesCount, 0);
    });

    it('resets compiled count', async () => {
      await fixtures.service.loadRule('test', 'rule test { condition: true }');
      await fixtures.service.clearRules();
      const status = fixtures.service.getStatus();
      assert.strictEqual(status.compiledRulesCount, 0);
    });

    it('can be called multiple times', async () => {
      await fixtures.service.clearRules();
      await fixtures.service.clearRules();
      const status = fixtures.service.getStatus();
      assert.strictEqual(status.loadedRulesCount, 0);
    });
  });

  describe('with logger', () => {
    it('logs info on initialization', async () => {
      const logs = [];
      const mockLogger = {
        info: (msg) => logs.push({ level: 'info', msg }),
        warn: (_data, msg) => logs.push({ level: 'warn', msg }),
        error: (_data, msg) => logs.push({ level: 'error', msg }),
        debug: (_data, msg) => logs.push({ level: 'debug', msg }),
      };
      const serviceWithLogger = new YaraEngineService(fixtures.staticRulesService, mockLogger);
      await serviceWithLogger.initialize();
      assert.ok(logs.some((l) => l.level === 'info'));
    });
  });
});
