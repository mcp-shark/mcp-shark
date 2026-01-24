import assert from 'node:assert';
import { beforeEach, describe, test } from 'node:test';
import { buildKv } from '../../../external/kv.js';
import { createPromptsListHandler } from '../prompts-list.js';

function createMockLogger() {
  return { debug: () => {} };
}

describe('prompts-list', () => {
  const ctx = {};

  beforeEach(() => {
    ctx.mockCallTool = async () => ({ result: 'called' });
    ctx.mockReadResource = async () => ({ result: 'read' });
    ctx.mockGetPrompt = async () => ({ result: 'prompt' });

    ctx.servers = [
      {
        name: 'server1',
        tools: [],
        resources: [],
        prompts: [
          { name: 'prompt1', description: 'Prompt 1' },
          { name: 'prompt2', description: 'Prompt 2' },
        ],
        callTool: ctx.mockCallTool,
        readResource: ctx.mockReadResource,
        getPrompt: ctx.mockGetPrompt,
      },
    ];
    ctx.mcpServers = buildKv(ctx.servers);
    ctx.logger = createMockLogger();
  });

  describe('createPromptsListHandler', () => {
    test('returns handler function', () => {
      const handler = createPromptsListHandler(ctx.logger, ctx.mcpServers, 'server1');
      assert.strictEqual(typeof handler, 'function');
    });

    test('handler returns prompts array', async () => {
      const handler = createPromptsListHandler(ctx.logger, ctx.mcpServers, 'server1');
      const req = { path: '/prompts' };

      const result = await handler(req);

      assert.ok(result.prompts);
      assert.ok(Array.isArray(result.prompts));
      assert.strictEqual(result.prompts.length, 2);
    });

    test('handler returns empty prompts for unknown server', async () => {
      const handler = createPromptsListHandler(ctx.logger, ctx.mcpServers, 'unknown');
      const req = { path: '/prompts' };

      const result = await handler(req);

      assert.ok(result.prompts);
      assert.strictEqual(result.prompts.length, 0);
    });
  });
});
