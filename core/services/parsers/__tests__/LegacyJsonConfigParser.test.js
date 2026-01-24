import assert from 'node:assert';
import { beforeEach, describe, test } from 'node:test';
import { LegacyJsonConfigParser } from '../LegacyJsonConfigParser.js';

describe('LegacyJsonConfigParser', () => {
  const ctx = {};

  beforeEach(() => {
    ctx.parser = new LegacyJsonConfigParser();
  });

  describe('parse', () => {
    test('parses valid JSON', () => {
      const content = '{"servers": {"s1": {"type": "stdio"}}}';
      const result = ctx.parser.parse(content);

      assert.ok(result);
      assert.ok(result.servers);
    });

    test('returns null for invalid JSON', () => {
      const result = ctx.parser.parse('{ not valid }');
      assert.strictEqual(result, null);
    });
  });

  describe('isLegacyFormat', () => {
    test('returns true for legacy servers format', () => {
      const config = { servers: { s1: { type: 'stdio' } } };
      assert.strictEqual(ctx.parser.isLegacyFormat(config), true);
    });

    test('returns false if mcpServers is present', () => {
      const config = { servers: { s1: {} }, mcpServers: { s2: {} } };
      assert.strictEqual(ctx.parser.isLegacyFormat(config), false);
    });

    test('returns false for mcpServers-only format', () => {
      const config = { mcpServers: { s1: {} } };
      assert.strictEqual(ctx.parser.isLegacyFormat(config), false);
    });

    test('returns falsy for null config', () => {
      assert.ok(!ctx.parser.isLegacyFormat(null));
    });
  });

  describe('convertToInternalFormat', () => {
    test('converts legacy format with type inference', () => {
      const config = {
        servers: {
          server1: { command: 'node', args: ['s.js'] },
          server2: { url: 'http://example.com' },
        },
      };

      const result = ctx.parser.convertToInternalFormat(config);

      assert.ok(result);
      assert.ok(result.servers);
      assert.strictEqual(result.servers.server1.type, 'stdio');
    });

    test('preserves existing type', () => {
      const config = {
        servers: {
          server1: { type: 'http', url: 'http://test.com' },
        },
      };

      const result = ctx.parser.convertToInternalFormat(config);
      assert.strictEqual(result.servers.server1.type, 'http');
    });

    test('returns null for non-legacy format', () => {
      const config = { mcpServers: { s1: {} } };
      const result = ctx.parser.convertToInternalFormat(config);
      assert.strictEqual(result, null);
    });

    test('returns null for empty servers', () => {
      const config = { servers: {} };
      const result = ctx.parser.convertToInternalFormat(config);
      assert.strictEqual(result, null);
    });

    test('skips invalid server configs', () => {
      const config = {
        servers: {
          valid: { type: 'stdio', command: 'node' },
          invalid: null,
        },
      };

      const result = ctx.parser.convertToInternalFormat(config);
      assert.strictEqual(Object.keys(result.servers).length, 1);
    });
  });
});
