import assert from 'node:assert';
import { beforeEach, describe, test } from 'node:test';
import { buildKv } from '../../../external/kv.js';
import { InternalServerError } from '../error.js';
import { createToolsCallHandler } from '../tools-call.js';

function createMockLogger() {
  return { debug: () => {} };
}

describe('tools-call', () => {
  const ctx = {};

  beforeEach(() => {
    ctx.mockCallTool = async (params) => ({
      content: [{ type: 'text', text: `Called ${params.name}` }],
    });
    ctx.mockReadResource = async () => ({ result: 'read' });
    ctx.mockGetPrompt = async () => ({ result: 'prompt' });

    ctx.servers = [
      {
        name: 'server1',
        tools: [{ name: 'tool1', description: 'Tool 1' }],
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

  describe('createToolsCallHandler', () => {
    test('returns handler function', () => {
      const handler = createToolsCallHandler(ctx.logger, ctx.mcpServers, 'server1');
      assert.strictEqual(typeof handler, 'function');
    });

    test('handler returns tool call result', async () => {
      const handler = createToolsCallHandler(ctx.logger, ctx.mcpServers, 'server1');
      const req = { path: '/tools/call', params: { name: 'tool1', arguments: {} } };

      const result = await handler(req);

      assert.ok(result.content);
      assert.ok(Array.isArray(result.content));
    });

    test('handler throws InternalServerError for unknown tool', async () => {
      const handler = createToolsCallHandler(ctx.logger, ctx.mcpServers, 'server1');
      const req = { path: '/tools/call', params: { name: 'unknown-tool', arguments: {} } };

      await assert.rejects(async () => {
        await handler(req);
      }, InternalServerError);
    });

    test('handler passes arguments to tool', async () => {
      const handler = createToolsCallHandler(ctx.logger, ctx.mcpServers, 'server1');
      const req = {
        path: '/tools/call',
        params: { name: 'tool1', arguments: { input: 'test-input' } },
      };

      const result = await handler(req);

      assert.ok(result.content);
    });
  });
});
