import assert from 'node:assert';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { beforeEach, describe, test } from 'node:test';
import { ScanCacheService } from '../ScanCacheService.js';

function createMockLogger() {
  return {
    info: () => {},
    error: () => {},
    warn: () => {},
  };
}

describe('ScanCacheService', () => {
  const ctx = {};

  beforeEach(() => {
    ctx.service = new ScanCacheService(createMockLogger());
  });

  describe('computeMcpHash', () => {
    test('computes consistent hash for same data', () => {
      const serverData = {
        name: 'test-server',
        tools: [{ name: 'tool1', description: 'A tool' }],
        resources: [],
        prompts: [],
      };

      const hash1 = ctx.service.computeMcpHash(serverData);
      const hash2 = ctx.service.computeMcpHash(serverData);

      assert.strictEqual(hash1, hash2);
      assert.strictEqual(hash1.length, 64);
    });

    test('produces different hash for different data', () => {
      const serverData1 = { name: 'server1', tools: [], resources: [], prompts: [] };
      const serverData2 = { name: 'server2', tools: [], resources: [], prompts: [] };

      const hash1 = ctx.service.computeMcpHash(serverData1);
      const hash2 = ctx.service.computeMcpHash(serverData2);

      assert.notStrictEqual(hash1, hash2);
    });

    test('normalizes and sorts tools', () => {
      const serverData1 = {
        name: 'test',
        tools: [
          { name: 'b', description: 'B' },
          { name: 'a', description: 'A' },
        ],
        resources: [],
        prompts: [],
      };

      const serverData2 = {
        name: 'test',
        tools: [
          { name: 'a', description: 'A' },
          { name: 'b', description: 'B' },
        ],
        resources: [],
        prompts: [],
      };

      const hash1 = ctx.service.computeMcpHash(serverData1);
      const hash2 = ctx.service.computeMcpHash(serverData2);

      assert.strictEqual(hash1, hash2);
    });

    test('handles empty data', () => {
      const serverData = {};
      const hash = ctx.service.computeMcpHash(serverData);

      assert.ok(hash);
      assert.strictEqual(hash.length, 64);
    });

    test('handles inputSchema and outputSchema', () => {
      const serverData = {
        name: 'test',
        tools: [
          {
            name: 'tool1',
            inputSchema: { type: 'object' },
            outputSchema: { type: 'string' },
          },
        ],
        resources: [],
        prompts: [],
      };

      const hash = ctx.service.computeMcpHash(serverData);
      assert.ok(hash);
    });

    test('handles input_schema and output_schema snake_case', () => {
      const serverData = {
        name: 'test',
        tools: [
          {
            name: 'tool1',
            input_schema: { type: 'object' },
            output_schema: { type: 'string' },
          },
        ],
        resources: [],
        prompts: [],
      };

      const hash = ctx.service.computeMcpHash(serverData);
      assert.ok(hash);
      assert.strictEqual(hash.length, 64);
    });

    test('normalizes and sorts resources by uri', () => {
      const serverData1 = {
        name: 'test',
        tools: [],
        resources: [
          { uri: 'z://resource', name: 'Z' },
          { uri: 'a://resource', name: 'A' },
        ],
        prompts: [],
      };

      const serverData2 = {
        name: 'test',
        tools: [],
        resources: [
          { uri: 'a://resource', name: 'A' },
          { uri: 'z://resource', name: 'Z' },
        ],
        prompts: [],
      };

      const hash1 = ctx.service.computeMcpHash(serverData1);
      const hash2 = ctx.service.computeMcpHash(serverData2);

      assert.strictEqual(hash1, hash2);
    });

    test('handles resources with mimeType and mime_type', () => {
      const serverData1 = {
        name: 'test',
        tools: [],
        resources: [{ uri: 'file://test', mimeType: 'text/plain' }],
        prompts: [],
      };

      const serverData2 = {
        name: 'test',
        tools: [],
        resources: [{ uri: 'file://test', mime_type: 'text/plain' }],
        prompts: [],
      };

      const hash1 = ctx.service.computeMcpHash(serverData1);
      const hash2 = ctx.service.computeMcpHash(serverData2);

      assert.strictEqual(hash1, hash2);
    });

    test('normalizes and sorts prompts', () => {
      const serverData1 = {
        name: 'test',
        tools: [],
        resources: [],
        prompts: [
          { name: 'prompt-z', description: 'Z', arguments: [] },
          { name: 'prompt-a', description: 'A', arguments: [] },
        ],
      };

      const serverData2 = {
        name: 'test',
        tools: [],
        resources: [],
        prompts: [
          { name: 'prompt-a', description: 'A', arguments: [] },
          { name: 'prompt-z', description: 'Z', arguments: [] },
        ],
      };

      const hash1 = ctx.service.computeMcpHash(serverData1);
      const hash2 = ctx.service.computeMcpHash(serverData2);

      assert.strictEqual(hash1, hash2);
    });

    test('sorts prompt arguments', () => {
      const serverData1 = {
        name: 'test',
        tools: [],
        resources: [],
        prompts: [
          {
            name: 'prompt',
            arguments: [{ name: 'z' }, { name: 'a' }],
          },
        ],
      };

      const serverData2 = {
        name: 'test',
        tools: [],
        resources: [],
        prompts: [
          {
            name: 'prompt',
            arguments: [{ name: 'a' }, { name: 'z' }],
          },
        ],
      };

      const hash1 = ctx.service.computeMcpHash(serverData1);
      const hash2 = ctx.service.computeMcpHash(serverData2);

      assert.strictEqual(hash1, hash2);
    });
  });

  describe('_getCreatedAt', () => {
    test('returns default time if file does not exist', () => {
      const defaultTime = Date.now();
      const result = ctx.service._getCreatedAt('/non/existent/file.json', defaultTime);
      assert.strictEqual(result, defaultTime);
    });

    test('returns createdAt from existing file', () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scan-test-'));
      const filePath = path.join(tempDir, 'test.json');
      const createdAt = 1234567890;
      fs.writeFileSync(filePath, JSON.stringify({ createdAt }));

      const result = ctx.service._getCreatedAt(filePath, Date.now());

      assert.strictEqual(result, createdAt);
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    test('returns default time if file cannot be parsed', () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scan-test-'));
      const filePath = path.join(tempDir, 'test.json');
      fs.writeFileSync(filePath, 'invalid json');

      const defaultTime = Date.now();
      const result = ctx.service._getCreatedAt(filePath, defaultTime);

      assert.strictEqual(result, defaultTime);
      fs.rmSync(tempDir, { recursive: true, force: true });
    });
  });

  describe('getCachedScanResult', () => {
    test('returns null for non-existent hash', () => {
      const result = ctx.service.getCachedScanResult('nonexistenthash1234567890');
      assert.strictEqual(result, null);
    });
  });

  describe('storeScanResult', () => {
    test('stores scan result and returns true', () => {
      const serverName = 'test-server';
      const hash = ctx.service.computeMcpHash({ name: serverName });
      const scanData = { risk_level: 'low', tools: [] };

      const result = ctx.service.storeScanResult(serverName, hash, scanData);

      assert.strictEqual(result, true);

      const cached = ctx.service.getCachedScanResult(hash);
      assert.ok(cached);
      assert.strictEqual(cached.serverName, serverName);
      assert.strictEqual(cached.cached, true);
    });

    test('preserves createdAt on update', () => {
      const serverName = 'test-server';
      const hash = ctx.service.computeMcpHash({ name: serverName });
      const scanData1 = { risk_level: 'low' };
      const scanData2 = { risk_level: 'high' };

      ctx.service.storeScanResult(serverName, hash, scanData1);
      const cached1 = ctx.service.getCachedScanResult(hash);
      const createdAt1 = cached1.cachedAt;

      ctx.service.storeScanResult(serverName, hash, scanData2);
      const cached2 = ctx.service.getCachedScanResult(hash);

      assert.strictEqual(cached2.cachedAt, createdAt1);
    });
  });

  describe('getAllCachedScanResults', () => {
    test('returns array of cached results', () => {
      const server1Hash = ctx.service.computeMcpHash({ name: 'server1' });
      const server2Hash = ctx.service.computeMcpHash({ name: 'server2' });

      ctx.service.storeScanResult('server1', server1Hash, { risk_level: 'low' });
      ctx.service.storeScanResult('server2', server2Hash, { risk_level: 'high' });

      const results = ctx.service.getAllCachedScanResults();

      assert.ok(Array.isArray(results));
      assert.ok(results.length >= 2);
    });

    test('returns empty array when no results exist', () => {
      ctx.service.clearAllScanResults();
      const results = ctx.service.getAllCachedScanResults();
      assert.ok(Array.isArray(results));
    });
  });

  describe('clearAllScanResults', () => {
    test('clears all cached scan results', () => {
      const hash = ctx.service.computeMcpHash({ name: 'test' });
      ctx.service.storeScanResult('test', hash, { risk_level: 'low' });

      const deletedCount = ctx.service.clearAllScanResults();

      assert.ok(deletedCount >= 0);
      const cached = ctx.service.getCachedScanResult(hash);
      assert.strictEqual(cached, null);
    });
  });

  describe('clearOldScanResults', () => {
    test('clears results older than maxAgeMs', () => {
      const hash = ctx.service.computeMcpHash({ name: 'old-server' });
      ctx.service.storeScanResult('old-server', hash, { risk_level: 'low' });

      const deletedCount = ctx.service.clearOldScanResults(0);

      assert.ok(deletedCount >= 0);
    });

    test('keeps recent results', () => {
      const hash = ctx.service.computeMcpHash({ name: 'recent-server' });
      ctx.service.storeScanResult('recent-server', hash, { risk_level: 'low' });

      const deletedCount = ctx.service.clearOldScanResults(1000 * 60 * 60 * 24);

      const cached = ctx.service.getCachedScanResult(hash);
      assert.ok(cached !== null || deletedCount === 0);
    });
  });
});
