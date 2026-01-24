import assert from 'node:assert';
import { beforeEach, describe, test } from 'node:test';
import { buildKv } from '../../../external/kv.js';
import { createToolsListHandler } from '../tools-list.js';

function createMockLogger() {
  return { debug: () => {} };
}

describe('tools-list', () => {
  const ctx = {};

  beforeEach(() => {
    ctx.mockCallTool = async () => ({ result: 'called' });
    ctx.mockReadResource = async () => ({ result: 'read' });
    ctx.mockGetPrompt = async () => ({ result: 'prompt' });

    ctx.servers = [
      {
        name: 'server1',
        tools: [
          { name: 'tool1', description: 'Tool 1' },
          { name: 'tool2', description: 'Tool 2' },
        ],
        resources: [],
        prompts: [],
        callTool: ctx.mockCallTool,
        readResource: ctx.mockReadResource,
        getPrompt: ctx.mockGetPrompt,
      },
    ];
    ctx.mcpServers = buildKv(ctx.servers);
    ctx.logger = createMockLogger();
  });

  describe('createToolsListHandler', () => {
    test('returns handler function', () => {
      const handler = createToolsListHandler(ctx.logger, ctx.mcpServers, 'server1');
      assert.strictEqual(typeof handler, 'function');
    });

    test('handler returns tools array', async () => {
      const handler = createToolsListHandler(ctx.logger, ctx.mcpServers, 'server1');
      const req = { path: '/tools' };

      const result = await handler(req);

      assert.ok(result.tools);
      assert.ok(Array.isArray(result.tools));
      assert.strictEqual(result.tools.length, 2);
    });

    test('handler returns empty tools for unknown server', async () => {
      const handler = createToolsListHandler(ctx.logger, ctx.mcpServers, 'unknown');
      const req = { path: '/tools' };

      const result = await handler(req);

      assert.ok(result.tools);
      assert.strictEqual(result.tools.length, 0);
    });
  });
});
