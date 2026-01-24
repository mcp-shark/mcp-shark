import assert from 'node:assert';
import { describe, test } from 'node:test';
import { RequestError, listPrompts, listResources, listTools } from '../request.js';

describe('request', () => {
  describe('RequestError', () => {
    test('creates error with message', () => {
      const error = new RequestError('Test error');
      assert.strictEqual(error.name, 'RequestError');
    });

    test('creates error with cause', () => {
      const cause = new Error('Request failed');
      const error = new RequestError('Test error', cause);
      assert.strictEqual(error.name, 'RequestError');
    });
  });

  describe('listTools', () => {
    test('returns tools from client', async () => {
      const mockClient = {
        request: async () => ({
          tools: [{ name: 'tool1' }, { name: 'tool2' }],
        }),
      };

      const result = await listTools(mockClient);

      assert.ok(result.tools);
      assert.strictEqual(result.tools.length, 2);
    });

    test('returns empty tools array on method not found', async () => {
      const mockClient = {
        request: async () => {
          const error = new Error('Method not found');
          error.code = '-32601';
          throw error;
        },
      };

      const result = await listTools(mockClient);

      assert.ok(result.tools);
      assert.strictEqual(result.tools.length, 0);
    });

    test('returns RequestError on other errors', async () => {
      const mockClient = {
        request: async () => {
          throw new Error('Network error');
        },
      };

      const result = await listTools(mockClient);

      assert.ok(result instanceof RequestError);
    });
  });

  describe('listResources', () => {
    test('returns resources from client', async () => {
      const mockClient = {
        request: async () => ({
          resources: [{ uri: 'file://r1' }],
        }),
      };

      const result = await listResources(mockClient);

      assert.ok(result.resources);
      assert.strictEqual(result.resources.length, 1);
    });

    test('returns empty resources array on method not found', async () => {
      const mockClient = {
        request: async () => {
          const error = new Error('Method not found');
          error.code = '-32601';
          throw error;
        },
      };

      const result = await listResources(mockClient);

      assert.ok(result.resources);
      assert.strictEqual(result.resources.length, 0);
    });

    test('returns RequestError on other errors', async () => {
      const mockClient = {
        request: async () => {
          throw new Error('Network error');
        },
      };

      const result = await listResources(mockClient);

      assert.ok(result instanceof RequestError);
    });
  });

  describe('listPrompts', () => {
    test('returns prompts from client', async () => {
      const mockClient = {
        request: async () => ({
          prompts: [{ name: 'prompt1' }],
        }),
      };

      const result = await listPrompts(mockClient);

      assert.ok(result.prompts);
      assert.strictEqual(result.prompts.length, 1);
    });

    test('returns empty prompts array on method not found', async () => {
      const mockClient = {
        request: async () => {
          const error = new Error('Method not found');
          error.code = '-32601';
          throw error;
        },
      };

      const result = await listPrompts(mockClient);

      assert.ok(result.prompts);
      assert.strictEqual(result.prompts.length, 0);
    });

    test('returns RequestError on other errors', async () => {
      const mockClient = {
        request: async () => {
          throw new Error('Network error');
        },
      };

      const result = await listPrompts(mockClient);

      assert.ok(result instanceof RequestError);
    });
  });
});
