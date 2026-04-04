import assert from 'node:assert';
import { describe, it } from 'node:test';
import { computeDiff, countParameters, hashToolDefinition } from '../LockDiffEngine.js';

describe('LockDiffEngine', () => {
  describe('hashToolDefinition', () => {
    it('produces a SHA-256 hex string', () => {
      const hash = hashToolDefinition({ name: 'test-tool', description: 'A tool' });
      assert.match(hash, /^[a-f0-9]{64}$/);
    });

    it('is deterministic', () => {
      const tool = { name: 'read_file', description: 'Reads a file', inputSchema: {} };
      assert.strictEqual(hashToolDefinition(tool), hashToolDefinition(tool));
    });

    it('changes when description changes', () => {
      const a = hashToolDefinition({ name: 'tool', description: 'v1' });
      const b = hashToolDefinition({ name: 'tool', description: 'v2' });
      assert.notStrictEqual(a, b);
    });

    it('uses inputSchema or parameters', () => {
      const withSchema = hashToolDefinition({
        name: 'tool',
        description: 'd',
        inputSchema: { type: 'object' },
      });
      const withParams = hashToolDefinition({
        name: 'tool',
        description: 'd',
        parameters: { type: 'object' },
      });
      assert.strictEqual(withSchema, withParams);
    });
  });

  describe('countParameters', () => {
    it('counts properties in inputSchema', () => {
      const tool = {
        inputSchema: { properties: { path: {}, content: {} } },
      };
      assert.strictEqual(countParameters(tool), 2);
    });

    it('returns 0 for no schema', () => {
      assert.strictEqual(countParameters({}), 0);
    });
  });

  describe('computeDiff', () => {
    it('detects added server', () => {
      const lockData = { servers: {} };
      const current = [{ name: 'new-server', ide: 'Cursor', tools: [] }];
      const changes = computeDiff(lockData, current);
      assert.strictEqual(changes.length, 1);
      assert.strictEqual(changes[0].type, 'added_server');
      assert.strictEqual(changes[0].server, 'new-server');
    });

    it('detects removed server', () => {
      const lockData = { servers: { 'old-server': { tools: {} } } };
      const current = [];
      const changes = computeDiff(lockData, current);
      assert.strictEqual(changes.length, 1);
      assert.strictEqual(changes[0].type, 'removed_server');
    });

    it('detects added tool', () => {
      const lockData = { servers: { srv: { tools: {} } } };
      const current = [{ name: 'srv', tools: [{ name: 'new-tool', description: 'x' }] }];
      const changes = computeDiff(lockData, current);
      assert.strictEqual(changes[0].type, 'added_tool');
      assert.strictEqual(changes[0].tool, 'new-tool');
    });

    it('detects removed tool', () => {
      const lockData = {
        servers: { srv: { tools: { 'old-tool': { hash: 'sha256:abc' } } } },
      };
      const current = [{ name: 'srv', tools: [] }];
      const changes = computeDiff(lockData, current);
      assert.strictEqual(changes[0].type, 'removed_tool');
    });

    it('detects changed tool', () => {
      const tool = { name: 'my-tool', description: 'original' };
      const hash = `sha256:${hashToolDefinition(tool)}`;
      const lockData = { servers: { srv: { tools: { 'my-tool': { hash } } } } };
      const changed = { name: 'my-tool', description: 'modified' };
      const current = [{ name: 'srv', tools: [changed] }];
      const changes = computeDiff(lockData, current);
      assert.strictEqual(changes[0].type, 'changed_tool');
    });

    it('reports no changes when state matches lock', () => {
      const tool = { name: 'my-tool', description: 'same' };
      const hash = `sha256:${hashToolDefinition(tool)}`;
      const lockData = { servers: { srv: { tools: { 'my-tool': { hash } } } } };
      const current = [{ name: 'srv', tools: [{ name: 'my-tool', description: 'same' }] }];
      const changes = computeDiff(lockData, current);
      assert.strictEqual(changes.length, 0);
    });
  });
});
