import assert from 'node:assert';
import { describe, it } from 'node:test';
import { loadBuiltinJson, loadUserYamlList, loadUserYamlMap } from '../DataLoader.js';

describe('DataLoader', () => {
  describe('loadBuiltinJson', () => {
    it('loads secret-patterns.json', () => {
      const patterns = loadBuiltinJson('secret-patterns.json');
      assert.ok(Array.isArray(patterns), 'Should return an array');
      assert.ok(patterns.length > 0, 'Should have patterns');
      assert.ok(patterns[0].pattern, 'Each entry should have a pattern');
      assert.ok(patterns[0].name, 'Each entry should have a name');
    });

    it('loads tool-classifications.json', () => {
      const classifications = loadBuiltinJson('tool-classifications.json');
      assert.ok(typeof classifications === 'object');
      assert.ok(Object.keys(classifications).length > 0);
    });

    it('loads toxic-flow-rules.json', () => {
      const rules = loadBuiltinJson('toxic-flow-rules.json');
      assert.ok(Array.isArray(rules));
      assert.ok(rules.length > 0);
      assert.ok(rules[0].source, 'Each rule should have a source capability');
      assert.ok(rules[0].target, 'Each rule should have a target capability');
      assert.ok(rules[0].risk, 'Each rule should have a risk level');
    });

    it('loads rule-sources.json', () => {
      const sources = loadBuiltinJson('rule-sources.json');
      assert.ok(sources.registry_url);
      assert.ok(sources.cache_dir);
    });

    it('throws for nonexistent file', () => {
      assert.throws(() => loadBuiltinJson('nonexistent-file.json'));
    });
  });

  describe('loadUserYamlList', () => {
    it('returns empty array when file does not exist', () => {
      const result = loadUserYamlList('definitely-not-a-file.yaml');
      assert.deepStrictEqual(result, []);
    });
  });

  describe('loadUserYamlMap', () => {
    it('returns empty object when file does not exist', () => {
      const result = loadUserYamlMap('definitely-not-a-file.yaml');
      assert.deepStrictEqual(result, {});
    });
  });
});
