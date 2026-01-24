import assert from 'node:assert';
import { describe, test } from 'node:test';
import { ValidationError } from '#core/libraries/errors/ApplicationError.js';
import { handleError, handleValidationError } from '../errorHandler.js';

function createMockRes() {
  const res = {
    statusCode: null,
    jsonData: null,
    status: function (code) {
      this.statusCode = code;
      return this;
    },
    json: function (data) {
      this.jsonData = data;
      return this;
    },
  };
  return res;
}

function createMockLogger() {
  return {
    errorCalls: [],
    warnCalls: [],
    error: function (data, message) {
      this.errorCalls.push({ data, message });
    },
    warn: function (data, message) {
      this.warnCalls.push({ data, message });
    },
  };
}

describe('errorHandler', () => {
  describe('handleError', () => {
    test('handles ApplicationError', () => {
      const res = createMockRes();
      const logger = createMockLogger();
      const error = new ValidationError('Field is required');

      handleError(error, res, logger, 'Test context');

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.jsonData.error, 'ValidationError');
    });

    test('handles regular Error', () => {
      const res = createMockRes();
      const logger = createMockLogger();
      const error = new Error('Something went wrong');

      handleError(error, res, logger, 'Test context');

      assert.strictEqual(res.statusCode, 500);
    });

    test('logs error with context', () => {
      const res = createMockRes();
      const logger = createMockLogger();
      const error = new Error('Test error');

      handleError(error, res, logger, 'Custom context');

      assert.strictEqual(logger.errorCalls.length, 1);
      assert.strictEqual(logger.errorCalls[0].message, 'Custom context');
    });

    test('works without logger', () => {
      const res = createMockRes();
      const error = new Error('Test error');

      handleError(error, res, null, 'Test context');

      assert.strictEqual(res.statusCode, 500);
    });
  });

  describe('handleValidationError', () => {
    test('returns 400 with validation error response', () => {
      const res = createMockRes();
      const logger = createMockLogger();

      handleValidationError('Invalid email format', res, logger);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.jsonData.error, 'ValidationError');
      assert.strictEqual(res.jsonData.message, 'Invalid email format');
    });

    test('logs warning', () => {
      const res = createMockRes();
      const logger = createMockLogger();

      handleValidationError('Test message', res, logger);

      assert.strictEqual(logger.warnCalls.length, 1);
    });

    test('works without logger', () => {
      const res = createMockRes();

      handleValidationError('Test message', res, null);

      assert.strictEqual(res.statusCode, 400);
    });
  });
});
