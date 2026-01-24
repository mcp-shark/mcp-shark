import assert from 'node:assert';
import { describe, test } from 'node:test';
import { CompositeError, getErrors, isError } from '../ErrorLibrary.js';

describe('ErrorLibrary', () => {
  describe('CompositeError', () => {
    test('creates error with name and message', () => {
      const error = new CompositeError('TestError', 'Test message');

      assert.strictEqual(error.name, 'TestError');
      assert.ok(error instanceof Error);
    });

    test('stores underlying error', () => {
      const originalError = new Error('Original');
      const error = new CompositeError('TestError', 'Test message', originalError);

      assert.strictEqual(error.error, originalError);
    });
  });

  describe('isError', () => {
    test('returns true for CompositeError', () => {
      const error = new CompositeError('Test', 'Message');
      assert.strictEqual(isError(error), true);
    });

    test('returns true for Error', () => {
      const error = new Error('Standard error');
      assert.strictEqual(isError(error), true);
    });

    test('returns false for non-errors', () => {
      assert.strictEqual(isError('string'), false);
      assert.strictEqual(isError(123), false);
      assert.strictEqual(isError(null), false);
      assert.strictEqual(isError({}), false);
    });
  });

  describe('getErrors', () => {
    test('filters errors from results array', () => {
      const results = [
        { success: true },
        new Error('Error 1'),
        'not an error',
        new CompositeError('CE', 'Composite error'),
      ];

      const errors = getErrors(results);

      assert.strictEqual(errors.length, 2);
      assert.ok(errors[0] instanceof Error);
      assert.ok(errors[1] instanceof CompositeError);
    });

    test('returns empty array when no errors', () => {
      const results = [{ success: true }, 'string', 42];
      const errors = getErrors(results);

      assert.strictEqual(errors.length, 0);
    });
  });
});
