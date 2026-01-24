import assert from 'node:assert';
import { beforeEach, describe, test } from 'node:test';
import { buildKv } from '../../../external/kv.js';
import { InternalServerError } from '../error.js';
import { createPromptsGetHandler } from '../prompts-get.js';

function createMockLogger() {
  return { debug: () => {} };
}

describe('prompts-get', () => {
  const ctx = {};

  beforeEach(() => {
    ctx.mockCallTool = async () => ({ result: 'called' });
    ctx.mockReadResource = async () => ({ result: 'read' });
    ctx.mockGetPrompt = async (name, _args) => ({
      messages: [{ role: 'user', content: { type: 'text', text: `Prompt ${name}` } }],
    });

    ctx.servers = [
      {
        name: 'server1',
        tools: [],
        resources: [],
        prompts: [{ name: 'prompt1', description: 'Prompt 1' }],
        callTool: ctx.mockCallTool,
        readResource: ctx.mockReadResource,
        getPrompt: ctx.mockGetPrompt,
      },
    ];
    ctx.mcpServers = buildKv(ctx.servers);
    ctx.logger = createMockLogger();
  });

  describe('createPromptsGetHandler', () => {
    test('returns handler function', () => {
      const handler = createPromptsGetHandler(ctx.logger, ctx.mcpServers, 'server1');
      assert.strictEqual(typeof handler, 'function');
    });

    test('handler returns prompt result', async () => {
      const handler = createPromptsGetHandler(ctx.logger, ctx.mcpServers, 'server1');
      const req = { params: { name: 'prompt1', arguments: {} } };

      const result = await handler(req);

      assert.ok(result.messages);
      assert.ok(Array.isArray(result.messages));
    });

    test('handler throws InternalServerError for unknown prompt', async () => {
      const handler = createPromptsGetHandler(ctx.logger, ctx.mcpServers, 'server1');
      const req = { params: { name: 'unknown-prompt', arguments: {} } };

      await assert.rejects(async () => {
        await handler(req);
      }, InternalServerError);
    });

    test('handler handles missing arguments', async () => {
      const handler = createPromptsGetHandler(ctx.logger, ctx.mcpServers, 'server1');
      const req = { params: { name: 'prompt1' } };

      const result = await handler(req);

      assert.ok(result.messages);
    });
  });
});
