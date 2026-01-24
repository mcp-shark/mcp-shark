import assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, test } from 'node:test';
import {
  ensureScanResultsDirectory,
  getScanResultFilePath,
  getScanResultsDirectory,
} from '../directory.js';

describe('scan-cache/directory', () => {
  describe('getScanResultsDirectory', () => {
    test('returns a valid directory path', () => {
      const result = getScanResultsDirectory();

      assert.ok(typeof result === 'string');
      assert.ok(result.length > 0);
      assert.ok(result.endsWith('scan-results'));
    });
  });

  describe('ensureScanResultsDirectory', () => {
    test('creates directory if it does not exist and returns path', () => {
      const result = ensureScanResultsDirectory();

      assert.ok(typeof result === 'string');
      assert.ok(result.endsWith('scan-results'));
      assert.ok(fs.existsSync(result));
    });

    test('returns existing directory path if already exists', () => {
      const firstCall = ensureScanResultsDirectory();
      const secondCall = ensureScanResultsDirectory();

      assert.strictEqual(firstCall, secondCall);
      assert.ok(fs.existsSync(secondCall));
    });
  });

  describe('getScanResultFilePath', () => {
    test('returns path with .json extension', () => {
      const hash = 'abc123def456';
      const result = getScanResultFilePath(hash);

      assert.ok(result.endsWith(`${hash}.json`));
      assert.ok(result.includes('scan-results'));
    });

    test('ensures directory exists', () => {
      const hash = 'test-hash-123';
      const result = getScanResultFilePath(hash);
      const directory = path.dirname(result);

      assert.ok(fs.existsSync(directory));
    });

    test('returns consistent path for same hash', () => {
      const hash = 'consistent-hash';
      const result1 = getScanResultFilePath(hash);
      const result2 = getScanResultFilePath(hash);

      assert.strictEqual(result1, result2);
    });
  });
});
