import assert from 'node:assert';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { ConfigError, normalizeConfig } from '../config.js';

describe('config', () => {
  const ctx = {};

  beforeEach(() => {
    ctx.tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'config-test-'));
  });

  afterEach(() => {
    fs.rmSync(ctx.tempDir, { recursive: true, force: true });
  });

  describe('ConfigError', () => {
    test('creates error with message', () => {
      const error = new ConfigError('Test error');
      assert.strictEqual(error.name, 'ConfigError');
    });

    test('creates error with cause', () => {
      const cause = new Error('Cause');
      const error = new ConfigError('Test error', cause);
      assert.strictEqual(error.name, 'ConfigError');
    });
  });

  describe('normalizeConfig', () => {
    test('returns ConfigError for non-existent file', () => {
      const result = normalizeConfig('/non/existent/path.json');

      assert.ok(result instanceof ConfigError);
    });

    test('parses valid mcpServers config', () => {
      const configPath = path.join(ctx.tempDir, 'mcp.json');
      const config = {
        mcpServers: {
          server1: { command: 'node', args: ['server.js'] },
        },
      };
      fs.writeFileSync(configPath, JSON.stringify(config));

      const result = normalizeConfig(configPath);

      assert.ok(!(result instanceof ConfigError));
      assert.ok(result.server1);
      assert.strictEqual(result.server1.command, 'node');
    });

    test('adds default type stdio', () => {
      const configPath = path.join(ctx.tempDir, 'mcp.json');
      const config = {
        mcpServers: {
          server1: { command: 'node' },
        },
      };
      fs.writeFileSync(configPath, JSON.stringify(config));

      const result = normalizeConfig(configPath);

      assert.strictEqual(result.server1.type, 'stdio');
    });

    test('preserves explicit type', () => {
      const configPath = path.join(ctx.tempDir, 'mcp.json');
      const config = {
        mcpServers: {
          server1: { type: 'http', url: 'http://localhost:3000' },
        },
      };
      fs.writeFileSync(configPath, JSON.stringify(config));

      const result = normalizeConfig(configPath);

      assert.strictEqual(result.server1.type, 'http');
    });

    test('returns ConfigError for invalid JSON', () => {
      const configPath = path.join(ctx.tempDir, 'mcp.json');
      fs.writeFileSync(configPath, 'invalid json');

      const result = normalizeConfig(configPath);

      assert.ok(result instanceof ConfigError);
    });

    test('returns ConfigError for empty config', () => {
      const configPath = path.join(ctx.tempDir, 'mcp.json');
      fs.writeFileSync(configPath, '{}');

      const result = normalizeConfig(configPath);

      assert.ok(result instanceof ConfigError);
    });

    test('returns ConfigError for config with empty mcpServers', () => {
      const configPath = path.join(ctx.tempDir, 'mcp.json');
      fs.writeFileSync(configPath, JSON.stringify({ mcpServers: {} }));

      const result = normalizeConfig(configPath);

      assert.ok(result instanceof ConfigError);
    });

    test('handles multiple servers', () => {
      const configPath = path.join(ctx.tempDir, 'mcp.json');
      const config = {
        mcpServers: {
          server1: { command: 'node', args: ['s1.js'] },
          server2: { command: 'python', args: ['s2.py'] },
        },
      };
      fs.writeFileSync(configPath, JSON.stringify(config));

      const result = normalizeConfig(configPath);

      assert.ok(result.server1);
      assert.ok(result.server2);
      assert.strictEqual(result.server1.command, 'node');
      assert.strictEqual(result.server2.command, 'python');
    });
  });
});
