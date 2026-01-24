import assert from 'node:assert';
import { beforeEach, describe, test } from 'node:test';
import { buildKv } from '../../../external/kv.js';
import { createResourcesListHandler } from '../resources-list.js';

function createMockLogger() {
  return { debug: () => {} };
}

describe('resources-list', () => {
  const ctx = {};

  beforeEach(() => {
    ctx.mockCallTool = async () => ({ result: 'called' });
    ctx.mockReadResource = async () => ({ result: 'read' });
    ctx.mockGetPrompt = async () => ({ result: 'prompt' });

    ctx.servers = [
      {
        name: 'server1',
        tools: [],
        resources: [
          { name: 'resource1', uri: 'file://r1' },
          { name: 'resource2', uri: 'file://r2' },
        ],
        prompts: [],
        callTool: ctx.mockCallTool,
        readResource: ctx.mockReadResource,
        getPrompt: ctx.mockGetPrompt,
      },
    ];
    ctx.mcpServers = buildKv(ctx.servers);
    ctx.logger = createMockLogger();
  });

  describe('createResourcesListHandler', () => {
    test('returns handler function', () => {
      const handler = createResourcesListHandler(ctx.logger, ctx.mcpServers, 'server1');
      assert.strictEqual(typeof handler, 'function');
    });

    test('handler returns resources array', async () => {
      const handler = createResourcesListHandler(ctx.logger, ctx.mcpServers, 'server1');
      const req = { path: '/resources' };

      const result = await handler(req);

      assert.ok(result.resources);
      assert.ok(Array.isArray(result.resources));
      assert.strictEqual(result.resources.length, 2);
    });

    test('handler returns empty resources for unknown server', async () => {
      const handler = createResourcesListHandler(ctx.logger, ctx.mcpServers, 'unknown');
      const req = { path: '/resources' };

      const result = await handler(req);

      assert.ok(result.resources);
      assert.strictEqual(result.resources.length, 0);
    });
  });
});
