import assert from 'node:assert';
import { beforeEach, describe, test } from 'node:test';
import { ConfigTransformService } from '../ConfigTransformService.js';

describe('ConfigTransformService', () => {
  const ctx = {};
  const mockParserFactory = {
    normalizeToInternalFormat: (config) => config,
  };

  beforeEach(() => {
    ctx.service = new ConfigTransformService(mockParserFactory);
  });

  describe('convertMcpServersToServers', () => {
    test('converts mcpServers to servers format', () => {
      const config = {
        mcpServers: {
          server1: { command: 'node', args: ['server.js'] },
          server2: { url: 'http://localhost:3000' },
        },
      };

      const result = ctx.service.convertMcpServersToServers(config);

      assert.ok(result.servers.server1);
      assert.ok(result.servers.server2);
      assert.strictEqual(result.servers.server1.type, 'stdio');
      assert.strictEqual(result.servers.server2.type, 'http');
    });

    test('preserves existing servers', () => {
      const config = {
        servers: {
          existing: { type: 'http', url: 'http://example.com' },
        },
      };

      const result = ctx.service.convertMcpServersToServers(config);

      assert.ok(result.servers.existing);
      assert.strictEqual(result.servers.existing.url, 'http://example.com');
    });

    test('returns empty servers for null config', () => {
      const result = ctx.service.convertMcpServersToServers(null);
      assert.deepStrictEqual(result, { servers: {} });
    });

    test('drops mcp-shark self-reference from mcpServers', () => {
      const config = {
        mcpServers: {
          'mcp-shark': { url: 'http://127.0.0.1:9851/mcp' },
          real: { command: 'node', args: ['s.js'] },
        },
      };

      const result = ctx.service.convertMcpServersToServers(config);

      assert.strictEqual(result.servers['mcp-shark'], undefined);
      assert.ok(result.servers.real);
    });

    test('drops self-reference from legacy servers shape', () => {
      const config = {
        servers: {
          'mcp-shark': { type: 'http', url: 'http://localhost:9851/mcp' },
          ok: { type: 'stdio', command: 'node' },
        },
      };

      const result = ctx.service.convertMcpServersToServers(config);

      assert.strictEqual(result.servers['mcp-shark'], undefined);
      assert.ok(result.servers.ok);
    });

    test('drops entries whose URL points at proxy port even with custom name', () => {
      const config = {
        mcpServers: {
          'custom-loop': { url: 'http://127.0.0.1:9851/mcp' },
          remote: { url: 'http://api.example.com:9851/mcp' },
        },
      };

      const result = ctx.service.convertMcpServersToServers(config);

      assert.strictEqual(result.servers['custom-loop'], undefined);
      assert.ok(result.servers.remote);
    });
  });

  describe('extractServices', () => {
    test('extracts services from servers', () => {
      const config = {
        servers: {
          server1: { type: 'stdio', command: 'node', args: ['s.js'] },
          server2: { type: 'http', url: 'http://localhost:3000' },
        },
      };

      const services = ctx.service.extractServices(config);

      assert.strictEqual(services.length, 2);
      assert.ok(services.find((s) => s.name === 'server1'));
      assert.ok(services.find((s) => s.name === 'server2'));
    });

    test('extracts services from mcpServers', () => {
      const config = {
        mcpServers: {
          mcp1: { command: 'python', args: ['server.py'] },
        },
      };

      const services = ctx.service.extractServices(config);

      assert.strictEqual(services.length, 1);
      assert.strictEqual(services[0].name, 'mcp1');
    });

    test('deduplicates services from both sources', () => {
      const config = {
        servers: { shared: { type: 'http', url: 'http://a.com' } },
        mcpServers: { shared: { command: 'node' } },
      };

      const services = ctx.service.extractServices(config);

      assert.strictEqual(services.length, 1);
    });
  });

  describe('filterServers', () => {
    test('filters servers by selected services', () => {
      const config = {
        servers: {
          server1: { type: 'http' },
          server2: { type: 'stdio' },
          server3: { type: 'http' },
        },
      };

      const result = ctx.service.filterServers(config, ['server1', 'server3']);

      assert.ok(result.servers.server1);
      assert.ok(result.servers.server3);
      assert.strictEqual(result.servers.server2, undefined);
    });

    test('returns original config for empty selection', () => {
      const config = { servers: { s1: {} } };
      const result = ctx.service.filterServers(config, []);
      assert.deepStrictEqual(result, config);
    });

    test('returns original config for null selection', () => {
      const config = { servers: { s1: {} } };
      const result = ctx.service.filterServers(config, null);
      assert.deepStrictEqual(result, config);
    });
  });

  describe('updateConfigForMcpShark', () => {
    test('updates servers to use MCP Shark endpoints', () => {
      const config = {
        mcpServers: {
          server1: { command: 'node', args: ['s.js'] },
        },
      };

      const result = ctx.service.updateConfigForMcpShark(config);

      assert.strictEqual(result.mcpServers.server1.type, 'http');
      assert.ok(result.mcpServers.server1.url.includes('localhost:9851/mcp/server1'));
    });

    test('URL encodes server names', () => {
      const config = {
        mcpServers: {
          'server with spaces': { command: 'node' },
        },
      };

      const result = ctx.service.updateConfigForMcpShark(config);

      assert.ok(result.mcpServers['server with spaces'].url.includes('server%20with%20spaces'));
    });
  });

  describe('getSelectedServiceNames', () => {
    test('returns provided selected services', () => {
      const config = { mcpServers: { s1: {}, s2: {} } };
      const result = ctx.service.getSelectedServiceNames(config, ['s1']);

      assert.ok(result.has('s1'));
      assert.strictEqual(result.size, 1);
    });

    test('returns all servers if no selection provided', () => {
      const config = { mcpServers: { s1: {}, s2: {} } };
      const result = ctx.service.getSelectedServiceNames(config, null);

      assert.ok(result.has('s1'));
      assert.ok(result.has('s2'));
    });
  });

  describe('isConfigPatched', () => {
    test('returns true for patched config', () => {
      const config = {
        mcpServers: {
          server1: { type: 'http', url: 'http://localhost:9851/mcp/server1' },
        },
      };

      assert.strictEqual(ctx.service.isConfigPatched(config), true);
    });

    test('returns false for unpatched config', () => {
      const config = {
        mcpServers: {
          server1: { command: 'node', args: ['server.js'] },
        },
      };

      assert.strictEqual(ctx.service.isConfigPatched(config), false);
    });

    test('returns false for null config', () => {
      assert.strictEqual(ctx.service.isConfigPatched(null), false);
    });
  });
});
