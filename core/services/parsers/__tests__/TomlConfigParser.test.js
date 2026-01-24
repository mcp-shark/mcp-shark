import assert from 'node:assert';
import { beforeEach, describe, test } from 'node:test';
import { TomlConfigParser } from '../TomlConfigParser.js';

describe('TomlConfigParser', () => {
  const ctx = {};

  beforeEach(() => {
    ctx.parser = new TomlConfigParser();
  });

  describe('parse', () => {
    test('parses valid TOML', () => {
      const content = `
[mcp_servers.test]
command = "node"
args = ["server.js"]
`;
      const result = ctx.parser.parse(content);

      assert.ok(result);
      assert.ok(result.mcp_servers);
      assert.ok(result.mcp_servers.test);
    });

    test('returns null for invalid TOML', () => {
      const result = ctx.parser.parse('[ invalid toml');
      assert.strictEqual(result, null);
    });
  });

  describe('isCodexFormat', () => {
    test('returns true for Codex format', () => {
      const config = { mcp_servers: { s1: { command: 'node' } } };
      assert.strictEqual(ctx.parser.isCodexFormat(config), true);
    });

    test('returns false for JSON format', () => {
      const config = { mcpServers: { s1: {} } };
      assert.strictEqual(ctx.parser.isCodexFormat(config), false);
    });

    test('returns falsy for null config', () => {
      assert.ok(!ctx.parser.isCodexFormat(null));
    });
  });

  describe('convertToMcpSharkFormat', () => {
    test('converts stdio server', () => {
      const config = {
        mcp_servers: {
          server1: {
            command: 'node',
            args: ['server.js'],
            env: { DEBUG: 'true' },
          },
        },
      };

      const result = ctx.parser.convertToMcpSharkFormat(config);

      assert.ok(result);
      assert.ok(result.mcpServers);
      assert.strictEqual(result.mcpServers.server1.type, 'stdio');
      assert.strictEqual(result.mcpServers.server1.command, 'node');
      assert.deepStrictEqual(result.mcpServers.server1.args, ['server.js']);
      assert.deepStrictEqual(result.mcpServers.server1.env, { DEBUG: 'true' });
    });

    test('converts http server', () => {
      const config = {
        mcp_servers: {
          httpServer: {
            url: 'http://localhost:3000',
            headers: { Authorization: 'Bearer token' },
          },
        },
      };

      const result = ctx.parser.convertToMcpSharkFormat(config);

      assert.strictEqual(result.mcpServers.httpServer.type, 'http');
      assert.strictEqual(result.mcpServers.httpServer.url, 'http://localhost:3000');
      assert.ok(result.mcpServers.httpServer.headers);
    });

    test('returns null for non-Codex format', () => {
      const config = { mcpServers: { s1: {} } };
      const result = ctx.parser.convertToMcpSharkFormat(config);
      assert.strictEqual(result, null);
    });

    test('returns null for empty mcp_servers', () => {
      const config = { mcp_servers: {} };
      const result = ctx.parser.convertToMcpSharkFormat(config);
      assert.strictEqual(result, null);
    });

    test('skips invalid server configs', () => {
      const config = {
        mcp_servers: {
          valid: { command: 'python' },
          invalid: null,
        },
      };

      const result = ctx.parser.convertToMcpSharkFormat(config);
      assert.strictEqual(Object.keys(result.mcpServers).length, 1);
    });
  });
});
