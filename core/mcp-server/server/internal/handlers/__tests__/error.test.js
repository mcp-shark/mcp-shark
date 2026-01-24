import assert from 'node:assert';
import { describe, test } from 'node:test';
import { InternalServerError } from '../error.js';

describe('error', () => {
  describe('InternalServerError', () => {
    test('creates error with message', () => {
      const error = new InternalServerError('Test error');
      assert.strictEqual(error.name, 'InternalServerError');
    });

    test('creates error with cause', () => {
      const cause = new Error('Root cause');
      const error = new InternalServerError('Test error', cause);
      assert.strictEqual(error.name, 'InternalServerError');
    });

    test('is instance of Error', () => {
      const error = new InternalServerError('Test');
      assert.ok(error instanceof Error);
    });
  });
});
