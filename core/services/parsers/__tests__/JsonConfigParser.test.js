import assert from 'node:assert';
import { beforeEach, describe, test } from 'node:test';
import { JsonConfigParser } from '../JsonConfigParser.js';

describe('JsonConfigParser', () => {
  const ctx = {};

  beforeEach(() => {
    ctx.parser = new JsonConfigParser();
  });

  describe('parse', () => {
    test('parses valid JSON', () => {
      const content = '{"mcpServers": {"s1": {"command": "node"}}}';
      const result = ctx.parser.parse(content);

      assert.ok(result);
      assert.ok(result.mcpServers);
      assert.ok(result.mcpServers.s1);
    });

    test('returns null for invalid JSON', () => {
      const result = ctx.parser.parse('{ invalid json }');
      assert.strictEqual(result, null);
    });

    test('returns null for non-object JSON', () => {
      const result = ctx.parser.parse('"just a string"');
      assert.strictEqual(result, null);
    });

    test('parses array JSON (arrays are objects in JS)', () => {
      const result = ctx.parser.parse('[1, 2, 3]');
      assert.ok(Array.isArray(result));
    });
  });

  describe('isMcpServersFormat', () => {
    test('returns true for mcpServers format', () => {
      const config = { mcpServers: { s1: { command: 'node' } } };
      assert.strictEqual(ctx.parser.isMcpServersFormat(config), true);
    });

    test('returns false for legacy servers format', () => {
      const config = { servers: { s1: { type: 'stdio' } } };
      assert.strictEqual(ctx.parser.isMcpServersFormat(config), false);
    });

    test('handles null config (returns falsy)', () => {
      assert.ok(!ctx.parser.isMcpServersFormat(null));
    });

    test('handles non-object config (returns falsy)', () => {
      assert.ok(!ctx.parser.isMcpServersFormat('string'));
    });
  });

  describe('normalizeToInternalFormat', () => {
    test('normalizes mcpServers format with type inference', () => {
      const config = {
        mcpServers: {
          stdioServer: { command: 'node', args: ['server.js'] },
          httpServer: { url: 'http://localhost:3000' },
        },
      };

      const result = ctx.parser.normalizeToInternalFormat(config);

      assert.ok(result);
      assert.strictEqual(result.mcpServers.stdioServer.type, 'stdio');
      assert.strictEqual(result.mcpServers.httpServer.type, 'http');
    });

    test('preserves explicit type', () => {
      const config = {
        mcpServers: {
          server1: { type: 'http', url: 'http://localhost' },
        },
      };

      const result = ctx.parser.normalizeToInternalFormat(config);
      assert.strictEqual(result.mcpServers.server1.type, 'http');
    });

    test('returns null for non-mcpServers format', () => {
      const config = { servers: { s1: {} } };
      const result = ctx.parser.normalizeToInternalFormat(config);
      assert.strictEqual(result, null);
    });

    test('returns null for empty mcpServers', () => {
      const config = { mcpServers: {} };
      const result = ctx.parser.normalizeToInternalFormat(config);
      assert.strictEqual(result, null);
    });

    test('skips invalid server configs', () => {
      const config = {
        mcpServers: {
          valid: { command: 'node' },
          invalid: null,
          alsoInvalid: 'string',
        },
      };

      const result = ctx.parser.normalizeToInternalFormat(config);
      assert.ok(result.mcpServers.valid);
      assert.strictEqual(Object.keys(result.mcpServers).length, 1);
    });
  });
});
