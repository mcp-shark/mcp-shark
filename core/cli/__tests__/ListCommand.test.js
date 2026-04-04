import assert from 'node:assert';
import { describe, it } from 'node:test';
import { getServerCapabilities, hasArgsPresent } from '../ListCommand.js';

describe('ListCommand helpers', () => {
  describe('hasArgsPresent', () => {
    it('is false when args are absent or empty', () => {
      assert.strictEqual(hasArgsPresent({}), false);
      assert.strictEqual(hasArgsPresent({ args: null }), false);
      assert.strictEqual(hasArgsPresent({ args: [] }), false);
      assert.strictEqual(hasArgsPresent({ args: {} }), false);
    });

    it('is true for non-empty array or object args', () => {
      assert.strictEqual(hasArgsPresent({ args: ['-y', 'pkg'] }), true);
      assert.strictEqual(hasArgsPresent({ args: { 0: 'a' } }), true);
    });

    it('is true for non-empty string args', () => {
      assert.strictEqual(hasArgsPresent({ args: 'run' }), true);
    });
  });

  describe('getServerCapabilities', () => {
    it('aggregates per-tool classifications from built-in data', () => {
      const label = getServerCapabilities('mcp-server-github');
      assert.ok(label, 'expected capability label for known server');
      assert.match(label, /secrets|code|untrusted|network|infra/);
    });

    it('returns null for unknown servers', () => {
      assert.strictEqual(getServerCapabilities('totally-unknown-server-xyz'), null);
    });
  });
});
