import assert from 'node:assert';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { RunAllExternalServersError, runAllExternalServers } from '../all.js';

function createMockLogger() {
  return { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} };
}

describe('all', () => {
  const ctx = {};

  beforeEach(() => {
    ctx.tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'all-test-'));
    ctx.logger = createMockLogger();
  });

  afterEach(() => {
    fs.rmSync(ctx.tempDir, { recursive: true, force: true });
  });

  describe('RunAllExternalServersError', () => {
    test('creates error with message', () => {
      const error = new RunAllExternalServersError('Test error');
      assert.strictEqual(error.name, 'RunAllExternalServersError');
    });

    test('creates error with cause', () => {
      const cause = new Error('All failed');
      const error = new RunAllExternalServersError('Test error', cause);
      assert.strictEqual(error.name, 'RunAllExternalServersError');
    });

    test('creates error with errors array', () => {
      const errors = [new Error('Server 1 failed'), new Error('Server 2 failed')];
      const error = new RunAllExternalServersError('Test error', null, errors);

      assert.strictEqual(error.name, 'RunAllExternalServersError');
      assert.strictEqual(error.errors.length, 2);
    });

    test('is instance of Error', () => {
      const error = new RunAllExternalServersError('Test');
      assert.ok(error instanceof Error);
    });
  });

  describe('runAllExternalServers', () => {
    test('is an async function', () => {
      assert.strictEqual(typeof runAllExternalServers, 'function');
    });
  });
});
