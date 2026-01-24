import assert from 'node:assert';
import { beforeEach, describe, test } from 'node:test';
import { buildKv, getBy, listAll } from '../kv.js';

describe('kv', () => {
  const ctx = {};

  beforeEach(() => {
    ctx.mockCallTool = async () => ({ result: 'tool-called' });
    ctx.mockReadResource = async () => ({ result: 'resource-read' });
    ctx.mockGetPrompt = async () => ({ result: 'prompt-got' });

    ctx.downstreamServers = [
      {
        name: 'server1',
        tools: [
          { name: 'tool1', description: 'Tool 1' },
          { name: 'tool2', description: 'Tool 2' },
        ],
        resources: [{ name: 'resource1', uri: 'file://resource1' }],
        prompts: [{ name: 'prompt1', description: 'Prompt 1' }],
        callTool: ctx.mockCallTool,
        readResource: ctx.mockReadResource,
        getPrompt: ctx.mockGetPrompt,
      },
    ];
  });

  describe('buildKv', () => {
    test('builds kv map from downstream servers', () => {
      const kv = buildKv(ctx.downstreamServers);

      assert.ok(kv instanceof Map);
      assert.ok(kv.has('server1'));
    });

    test('stores tools in toolsMap', () => {
      const kv = buildKv(ctx.downstreamServers);
      const entry = kv.get('server1');

      assert.ok(entry.toolsMap instanceof Map);
      assert.strictEqual(entry.toolsMap.size, 2);
      assert.ok(entry.toolsMap.has('tool1'));
      assert.ok(entry.toolsMap.has('tool2'));
    });

    test('stores resources in resourcesMap', () => {
      const kv = buildKv(ctx.downstreamServers);
      const entry = kv.get('server1');

      assert.ok(entry.resourcesMap instanceof Map);
      assert.strictEqual(entry.resourcesMap.size, 1);
      assert.ok(entry.resourcesMap.has('resource1'));
    });

    test('stores prompts in promptsMap', () => {
      const kv = buildKv(ctx.downstreamServers);
      const entry = kv.get('server1');

      assert.ok(entry.promptsMap instanceof Map);
      assert.strictEqual(entry.promptsMap.size, 1);
      assert.ok(entry.promptsMap.has('prompt1'));
    });

    test('stores tools array with names', () => {
      const kv = buildKv(ctx.downstreamServers);
      const entry = kv.get('server1');

      assert.ok(Array.isArray(entry.tools));
      assert.strictEqual(entry.tools.length, 2);
      assert.strictEqual(entry.tools[0].name, 'tool1');
    });

    test('stores resources array with names', () => {
      const kv = buildKv(ctx.downstreamServers);
      const entry = kv.get('server1');

      assert.ok(Array.isArray(entry.resources));
      assert.strictEqual(entry.resources.length, 1);
      assert.strictEqual(entry.resources[0].name, 'resource1');
    });

    test('stores prompts array with names', () => {
      const kv = buildKv(ctx.downstreamServers);
      const entry = kv.get('server1');

      assert.ok(Array.isArray(entry.prompts));
      assert.strictEqual(entry.prompts.length, 1);
      assert.strictEqual(entry.prompts[0].name, 'prompt1');
    });

    test('handles multiple servers', () => {
      const servers = [
        ...ctx.downstreamServers,
        {
          name: 'server2',
          tools: [{ name: 'tool3' }],
          resources: [],
          prompts: [],
          callTool: ctx.mockCallTool,
          readResource: ctx.mockReadResource,
          getPrompt: ctx.mockGetPrompt,
        },
      ];

      const kv = buildKv(servers);

      assert.ok(kv.has('server1'));
      assert.ok(kv.has('server2'));
    });
  });

  describe('getBy', () => {
    test('returns null for non-existent server', () => {
      const kv = buildKv(ctx.downstreamServers);
      const result = getBy(kv, 'nonexistent', 'tool1', 'callTool');

      assert.strictEqual(result, null);
    });

    test('returns tool handler for callTool action', () => {
      const kv = buildKv(ctx.downstreamServers);
      const result = getBy(kv, 'server1', 'tool1', 'callTool');

      assert.ok(typeof result === 'function');
    });

    test('returns resource handler for readResource action', () => {
      const kv = buildKv(ctx.downstreamServers);
      const result = getBy(kv, 'server1', 'resource1', 'readResource');

      assert.ok(typeof result === 'function');
    });

    test('returns prompt handler for getPrompt action', () => {
      const kv = buildKv(ctx.downstreamServers);
      const result = getBy(kv, 'server1', 'prompt1', 'getPrompt');

      assert.ok(typeof result === 'function');
    });

    test('returns tool handler for getTools action', () => {
      const kv = buildKv(ctx.downstreamServers);
      const result = getBy(kv, 'server1', 'tool1', 'getTools');

      assert.ok(typeof result === 'function');
    });

    test('returns resource handler for getResources action', () => {
      const kv = buildKv(ctx.downstreamServers);
      const result = getBy(kv, 'server1', 'resource1', 'getResources');

      assert.ok(typeof result === 'function');
    });

    test('returns prompt handler for getPrompts action', () => {
      const kv = buildKv(ctx.downstreamServers);
      const result = getBy(kv, 'server1', 'prompt1', 'getPrompts');

      assert.ok(typeof result === 'function');
    });

    test('returns null for unknown action', () => {
      const kv = buildKv(ctx.downstreamServers);
      const result = getBy(kv, 'server1', 'tool1', 'unknownAction');

      assert.strictEqual(result, null);
    });

    test('returns undefined for non-existent item', () => {
      const kv = buildKv(ctx.downstreamServers);
      const result = getBy(kv, 'server1', 'nonexistent', 'callTool');

      assert.strictEqual(result, undefined);
    });
  });

  describe('listAll', () => {
    test('returns empty array for non-existent server', () => {
      const kv = buildKv(ctx.downstreamServers);
      const result = listAll(kv, 'nonexistent', 'tools');

      assert.deepStrictEqual(result, []);
    });

    test('returns tools array', () => {
      const kv = buildKv(ctx.downstreamServers);
      const result = listAll(kv, 'server1', 'tools');

      assert.ok(Array.isArray(result));
      assert.strictEqual(result.length, 2);
    });

    test('returns resources array', () => {
      const kv = buildKv(ctx.downstreamServers);
      const result = listAll(kv, 'server1', 'resources');

      assert.ok(Array.isArray(result));
      assert.strictEqual(result.length, 1);
    });

    test('returns prompts array', () => {
      const kv = buildKv(ctx.downstreamServers);
      const result = listAll(kv, 'server1', 'prompts');

      assert.ok(Array.isArray(result));
      assert.strictEqual(result.length, 1);
    });
  });
});
