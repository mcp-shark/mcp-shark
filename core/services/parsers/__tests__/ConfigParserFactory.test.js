import assert from 'node:assert';
import { beforeEach, describe, test } from 'node:test';
import { ConfigParserFactory } from '../ConfigParserFactory.js';

describe('ConfigParserFactory', () => {
  const ctx = {};

  beforeEach(() => {
    ctx.factory = new ConfigParserFactory();
  });

  describe('detectFormat', () => {
    test('detects TOML format', () => {
      assert.strictEqual(ctx.factory.detectFormat('/path/to/config.toml'), 'toml');
      assert.strictEqual(ctx.factory.detectFormat('config.TOML'), 'toml');
    });

    test('detects JSON format', () => {
      assert.strictEqual(ctx.factory.detectFormat('/path/to/config.json'), 'json');
      assert.strictEqual(ctx.factory.detectFormat('mcp.json'), 'json');
    });

    test('returns null for unknown format', () => {
      assert.strictEqual(ctx.factory.detectFormat('/path/to/config.yaml'), null);
      assert.strictEqual(ctx.factory.detectFormat('file.txt'), null);
    });

    test('returns null for null input', () => {
      assert.strictEqual(ctx.factory.detectFormat(null), null);
    });
  });

  describe('getParser', () => {
    test('returns TOML parser for .toml files', () => {
      const parser = ctx.factory.getParser('/path/config.toml');
      assert.ok(parser);
      assert.ok(parser.isCodexFormat);
    });

    test('returns JSON parser for .json files', () => {
      const parser = ctx.factory.getParser('/path/mcp.json');
      assert.ok(parser);
      assert.ok(parser.isMcpServersFormat);
    });

    test('returns JSON parser for unknown extensions', () => {
      const parser = ctx.factory.getParser('/path/config');
      assert.ok(parser);
      assert.ok(parser.isMcpServersFormat);
    });
  });

  describe('parse', () => {
    test('parses JSON content', () => {
      const content = '{"mcpServers": {"s1": {"command": "node"}}}';
      const result = ctx.factory.parse(content, 'config.json');

      assert.ok(result);
      assert.ok(result.mcpServers);
    });

    test('parses TOML content', () => {
      const content = '[mcp_servers.test]\ncommand = "node"';
      const result = ctx.factory.parse(content, 'config.toml');

      assert.ok(result);
      assert.ok(result.mcp_servers);
    });

    test('uses JSON parser when no file path provided', () => {
      const content = '{"key": "value"}';
      const result = ctx.factory.parse(content);

      assert.ok(result);
      assert.strictEqual(result.key, 'value');
    });
  });

  describe('normalizeToInternalFormat', () => {
    test('normalizes Codex TOML format', () => {
      const config = {
        mcp_servers: {
          server1: { command: 'python', args: ['server.py'] },
        },
      };

      const result = ctx.factory.normalizeToInternalFormat(config);

      assert.ok(result);
      assert.ok(result.mcpServers);
      assert.ok(result.mcpServers.server1);
    });

    test('normalizes standard JSON format', () => {
      const config = {
        mcpServers: {
          server1: { command: 'node' },
        },
      };

      const result = ctx.factory.normalizeToInternalFormat(config);

      assert.ok(result);
      assert.ok(result.mcpServers);
    });

    test('normalizes legacy format', () => {
      const config = {
        servers: {
          server1: { type: 'stdio', command: 'node' },
        },
      };

      const result = ctx.factory.normalizeToInternalFormat(config);

      assert.ok(result);
      assert.ok(result.servers);
    });

    test('prefers mcpServers when both are present', () => {
      const config = {
        mcpServers: { mcp1: { command: 'node' } },
        servers: { legacy1: { command: 'python' } },
      };

      const result = ctx.factory.normalizeToInternalFormat(config);

      assert.ok(result);
      assert.ok(result.mcpServers);
      assert.strictEqual(result.servers, undefined);
    });

    test('returns null for invalid config', () => {
      assert.strictEqual(ctx.factory.normalizeToInternalFormat(null), null);
      assert.strictEqual(ctx.factory.normalizeToInternalFormat('string'), null);
      assert.strictEqual(ctx.factory.normalizeToInternalFormat({}), null);
    });
  });

  describe('parseAndNormalize', () => {
    test('parses and normalizes in one step', () => {
      const content = '{"mcpServers": {"s1": {"command": "node"}}}';
      const result = ctx.factory.parseAndNormalize(content, 'config.json');

      assert.ok(result);
      assert.ok(result.mcpServers);
      assert.strictEqual(result.mcpServers.s1.type, 'stdio');
    });

    test('returns null for invalid content', () => {
      const result = ctx.factory.parseAndNormalize('invalid json', 'config.json');
      assert.strictEqual(result, null);
    });
  });
});
