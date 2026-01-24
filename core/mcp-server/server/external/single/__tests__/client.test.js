import assert from 'node:assert';
import { describe, test } from 'node:test';
import { ClientError, closeClient, createClient } from '../client.js';

describe('client', () => {
  describe('ClientError', () => {
    test('creates error with message', () => {
      const error = new ClientError('Test error');
      assert.strictEqual(error.name, 'ClientError');
    });

    test('creates error with cause', () => {
      const cause = new Error('Connection failed');
      const error = new ClientError('Test error', cause);
      assert.strictEqual(error.name, 'ClientError');
    });
  });

  describe('createClient', () => {
    test('returns ClientError when transport fails to connect', async () => {
      const mockTransport = {
        start: () => Promise.reject(new Error('Connection refused')),
      };

      const result = await createClient({ transport: mockTransport });

      assert.ok(result instanceof ClientError);
    });
  });

  describe('closeClient', () => {
    test('returns ClientError when close fails', async () => {
      const mockClient = {
        close: () => Promise.reject(new Error('Close failed')),
      };

      const result = await closeClient(mockClient);

      assert.ok(result instanceof ClientError);
    });

    test('returns undefined when close succeeds', async () => {
      const mockClient = {
        close: () => Promise.resolve(),
      };

      const result = await closeClient(mockClient);

      assert.strictEqual(result, undefined);
    });
  });
});
