import assert from 'node:assert';
import { describe, test } from 'node:test';
import { RunError, runExternalServer } from '../run.js';

function createMockLogger() {
  return { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} };
}

describe('run', () => {
  describe('RunError', () => {
    test('creates error with message', () => {
      const error = new RunError('Test error');
      assert.strictEqual(error.name, 'RunError');
    });

    test('creates error with cause', () => {
      const cause = new Error('Run failed');
      const error = new RunError('Test error', cause);
      assert.strictEqual(error.name, 'RunError');
    });

    test('creates error with errors array', () => {
      const errors = [new Error('Error 1'), new Error('Error 2')];
      const error = new RunError('Test error', null, errors);

      assert.strictEqual(error.name, 'RunError');
      assert.strictEqual(error.errors.length, 2);
    });

    test('is instance of Error', () => {
      const error = new RunError('Test');
      assert.ok(error instanceof Error);
    });
  });

  describe('runExternalServer', () => {
    test('returns RunError for unsupported transport config', async () => {
      const logger = createMockLogger();

      const result = await runExternalServer({
        logger,
        name: 'test-server',
        config: { type: 'unsupported-type' },
      });

      assert.ok(result instanceof RunError);
    });

    test('logs debug message when starting', async () => {
      const debugCalls = [];
      const logger = {
        debug: (...args) => debugCalls.push(args),
        info: () => {},
        warn: () => {},
        error: () => {},
      };

      await runExternalServer({
        logger,
        name: 'test-server',
        config: { type: 'unsupported-type' },
      });

      assert.ok(debugCalls.length > 0);
      assert.ok(debugCalls[0][0].includes('Starting external server run'));
    });
  });
});
