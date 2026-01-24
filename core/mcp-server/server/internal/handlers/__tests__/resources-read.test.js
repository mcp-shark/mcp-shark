import assert from 'node:assert';
import { beforeEach, describe, test } from 'node:test';
import { buildKv } from '../../../external/kv.js';
import { InternalServerError } from '../error.js';
import { createResourcesReadHandler } from '../resources-read.js';

function createMockLogger() {
  return { debug: () => {} };
}

describe('resources-read', () => {
  const ctx = {};

  beforeEach(() => {
    ctx.mockCallTool = async () => ({ result: 'called' });
    ctx.mockReadResource = async (uri) => ({
      contents: [{ uri, mimeType: 'text/plain', text: `Content of ${uri}` }],
    });
    ctx.mockGetPrompt = async () => ({ result: 'prompt' });

    ctx.servers = [
      {
        name: 'server1',
        tools: [],
        resources: [{ name: 'file://resource1', uri: 'file://resource1' }],
        prompts: [],
        callTool: ctx.mockCallTool,
        readResource: ctx.mockReadResource,
        getPrompt: ctx.mockGetPrompt,
      },
    ];
    ctx.mcpServers = buildKv(ctx.servers);
    ctx.logger = createMockLogger();
  });

  describe('createResourcesReadHandler', () => {
    test('returns handler function', () => {
      const handler = createResourcesReadHandler(ctx.logger, ctx.mcpServers, 'server1');
      assert.strictEqual(typeof handler, 'function');
    });

    test('handler returns resource content', async () => {
      const handler = createResourcesReadHandler(ctx.logger, ctx.mcpServers, 'server1');
      const req = { path: '/resources/read', params: { uri: 'file://resource1' } };

      const result = await handler(req);

      assert.ok(result.contents);
      assert.ok(Array.isArray(result.contents));
    });

    test('handler throws InternalServerError for unknown resource', async () => {
      const handler = createResourcesReadHandler(ctx.logger, ctx.mcpServers, 'server1');
      const req = { path: '/resources/read', params: { uri: 'file://unknown' } };

      await assert.rejects(async () => {
        await handler(req);
      }, InternalServerError);
    });
  });
});
