import assert from 'node:assert';
import { describe, test } from 'node:test';
import { ConversationFilters } from '../ConversationFilters.js';

describe('ConversationFilters', () => {
  describe('constructor', () => {
    test('sets default values', () => {
      const filters = new ConversationFilters();

      assert.strictEqual(filters.sessionId, null);
      assert.strictEqual(filters.method, null);
      assert.strictEqual(filters.status, null);
      assert.strictEqual(filters.jsonrpcId, null);
      assert.strictEqual(filters.startTime, null);
      assert.strictEqual(filters.endTime, null);
      assert.ok(filters.limit > 0);
      assert.strictEqual(filters.offset, 0);
    });

    test('sets values from data', () => {
      const filters = new ConversationFilters({
        sessionId: 'sess-1',
        method: 'tools/call',
        status: 'completed',
        jsonrpcId: 'rpc-1',
        startTime: '1000000',
        endTime: '2000000',
        limit: 30,
        offset: 15,
      });

      assert.strictEqual(filters.sessionId, 'sess-1');
      assert.strictEqual(filters.method, 'tools/call');
      assert.strictEqual(filters.status, 'completed');
      assert.strictEqual(filters.jsonrpcId, 'rpc-1');
      assert.strictEqual(filters.startTime, '1000000');
      assert.strictEqual(filters.endTime, '2000000');
      assert.strictEqual(filters.limit, 30);
      assert.strictEqual(filters.offset, 15);
    });
  });

  describe('toRepositoryFilters', () => {
    test('converts to repository format', () => {
      const filters = new ConversationFilters({
        sessionId: 'sess-1',
        method: 'tools/call',
        status: 'pending',
        limit: 30,
      });

      const repoFilters = filters.toRepositoryFilters();

      assert.strictEqual(repoFilters.sessionId, 'sess-1');
      assert.strictEqual(repoFilters.method, 'tools/call');
      assert.strictEqual(repoFilters.status, 'pending');
      assert.strictEqual(repoFilters.limit, 30);
    });

    test('converts timestamps to BigInt', () => {
      const filters = new ConversationFilters({
        startTime: '1000000000000',
        endTime: '2000000000000',
      });

      const repoFilters = filters.toRepositoryFilters();

      assert.strictEqual(typeof repoFilters.startTime, 'bigint');
      assert.strictEqual(typeof repoFilters.endTime, 'bigint');
    });
  });
});
