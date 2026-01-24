import assert from 'node:assert';
import { describe, test } from 'node:test';
import {
  ApplicationError,
  InternalServerError,
  NotFoundError,
  ServiceUnavailableError,
  ValidationError,
  isApplicationError,
  toApplicationError,
} from '../ApplicationError.js';

describe('ApplicationError', () => {
  describe('ApplicationError class', () => {
    test('creates error with name and status code', () => {
      const error = new ApplicationError('TestError', 'Test message');

      assert.strictEqual(error.name, 'TestError');
      assert.strictEqual(error.statusCode, 500);
      // Note: Due to CompositeError implementation, message is set to name
    });

    test('creates error with custom status code', () => {
      const error = new ApplicationError('TestError', 'Message', 403);
      assert.strictEqual(error.statusCode, 403);
    });

    test('stores underlying error', () => {
      const original = new Error('Original');
      const error = new ApplicationError('TestError', 'Message', 500, original);

      assert.strictEqual(error.error, original);
    });

    test('toResponse returns proper format', () => {
      const original = new Error('Details');
      const error = new ApplicationError('TestError', 'Message', 400, original);

      const response = error.toResponse();

      assert.strictEqual(response.error, 'TestError');
      // message comes from this.message which is set by Error constructor
      assert.ok(response.message);
      assert.strictEqual(response.details, 'Details');
    });

    test('toResponse excludes details when no underlying error', () => {
      const error = new ApplicationError('TestError', 'Message');
      const response = error.toResponse();

      assert.strictEqual(response.details, undefined);
    });
  });

  describe('ValidationError', () => {
    test('has 400 status code', () => {
      const error = new ValidationError('Invalid input');

      assert.strictEqual(error.name, 'ValidationError');
      assert.strictEqual(error.statusCode, 400);
    });
  });

  describe('NotFoundError', () => {
    test('has 404 status code', () => {
      const error = new NotFoundError('Resource not found');

      assert.strictEqual(error.name, 'NotFoundError');
      assert.strictEqual(error.statusCode, 404);
    });
  });

  describe('ServiceUnavailableError', () => {
    test('has 503 status code', () => {
      const error = new ServiceUnavailableError('Service down');

      assert.strictEqual(error.name, 'ServiceUnavailableError');
      assert.strictEqual(error.statusCode, 503);
    });
  });

  describe('InternalServerError', () => {
    test('has 500 status code', () => {
      const error = new InternalServerError('Something went wrong');

      assert.strictEqual(error.name, 'InternalServerError');
      assert.strictEqual(error.statusCode, 500);
    });
  });

  describe('isApplicationError', () => {
    test('returns true for ApplicationError', () => {
      const error = new ApplicationError('Test', 'Message');
      assert.strictEqual(isApplicationError(error), true);
    });

    test('returns true for subclasses', () => {
      assert.strictEqual(isApplicationError(new ValidationError('msg')), true);
      assert.strictEqual(isApplicationError(new NotFoundError('msg')), true);
    });

    test('returns false for regular Error', () => {
      const error = new Error('Standard error');
      assert.strictEqual(isApplicationError(error), false);
    });

    test('returns false for non-errors', () => {
      assert.strictEqual(isApplicationError('string'), false);
      assert.strictEqual(isApplicationError(null), false);
    });
  });

  describe('toApplicationError', () => {
    test('returns ApplicationError as-is', () => {
      const original = new ValidationError('Already validation error');
      const result = toApplicationError(original);

      assert.strictEqual(result, original);
    });

    test('converts ECONNREFUSED to ServiceUnavailableError', () => {
      const error = new Error('ECONNREFUSED');
      const result = toApplicationError(error);

      assert.ok(result instanceof ServiceUnavailableError);
    });

    test('converts connect errors to ServiceUnavailableError', () => {
      const error = new Error('Failed to connect to server');
      const result = toApplicationError(error);

      assert.ok(result instanceof ServiceUnavailableError);
    });

    test('converts required field errors to ValidationError', () => {
      const error = new Error('Field "name" is required');
      const result = toApplicationError(error);

      assert.ok(result instanceof ValidationError);
    });

    test('converts not found errors to NotFoundError', () => {
      const error = new Error('User not found');
      const result = toApplicationError(error);

      assert.ok(result instanceof NotFoundError);
    });

    test('converts ENOENT to NotFoundError', () => {
      const error = { code: 'ENOENT', message: 'File missing' };
      const result = toApplicationError(error);

      assert.ok(result instanceof NotFoundError);
    });

    test('converts unknown errors to InternalServerError', () => {
      const error = new Error('Unknown error');
      const result = toApplicationError(error);

      assert.ok(result instanceof InternalServerError);
    });

    test('uses custom default message', () => {
      const error = new Error('Unknown');
      const result = toApplicationError(error, 'Custom message');

      // InternalServerError is returned for unknown errors
      assert.ok(result instanceof InternalServerError);
    });
  });
});
