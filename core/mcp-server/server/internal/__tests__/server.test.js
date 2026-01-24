import assert from 'node:assert';
import { beforeEach, describe, test } from 'node:test';
import { buildKv } from '../../external/kv.js';
import { createInternalServer, createInternalServerFactory } from '../server.js';

function createMockLogger() {
  return { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} };
}

describe('server', () => {
  const ctx = {};

  beforeEach(() => {
    ctx.mockCallTool = async () => ({ result: 'called' });
    ctx.mockReadResource = async () => ({ result: 'read' });
    ctx.mockGetPrompt = async () => ({ result: 'prompt' });

    ctx.servers = [
      {
        name: 'server1',
        tools: [{ name: 'tool1', description: 'Tool 1' }],
        resources: [{ name: 'resource1', uri: 'file://r1' }],
        prompts: [{ name: 'prompt1', description: 'Prompt 1' }],
        callTool: ctx.mockCallTool,
        readResource: ctx.mockReadResource,
        getPrompt: ctx.mockGetPrompt,
      },
    ];
    ctx.mcpServers = buildKv(ctx.servers);
    ctx.logger = createMockLogger();
  });

  describe('createInternalServer', () => {
    test('creates MCP server instance', () => {
      const server = createInternalServer(ctx.logger, ctx.mcpServers, 'server1');

      assert.ok(server);
      assert.ok(typeof server.connect === 'function');
    });

    test('creates server with correct name', () => {
      const server = createInternalServer(ctx.logger, ctx.mcpServers, 'test-server');

      assert.ok(server);
    });
  });

  describe('createInternalServerFactory', () => {
    test('returns factory function', () => {
      const factory = createInternalServerFactory(ctx.logger, ctx.mcpServers);

      assert.strictEqual(typeof factory, 'function');
    });

    test('factory creates server for requested server name', () => {
      const factory = createInternalServerFactory(ctx.logger, ctx.mcpServers);
      const server = factory('server1');

      assert.ok(server);
      assert.ok(typeof server.connect === 'function');
    });

    test('factory creates different servers for different names', () => {
      const factory = createInternalServerFactory(ctx.logger, ctx.mcpServers);
      const server1 = factory('server1');
      const server2 = factory('server2');

      assert.ok(server1);
      assert.ok(server2);
      assert.notStrictEqual(server1, server2);
    });
  });
});
