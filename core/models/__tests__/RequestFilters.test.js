import assert from 'node:assert';
import { describe, test } from 'node:test';
import { RequestFilters } from '../RequestFilters.js';

describe('RequestFilters', () => {
  describe('constructor', () => {
    test('sets default values', () => {
      const filters = new RequestFilters();

      assert.strictEqual(filters.sessionId, null);
      assert.strictEqual(filters.direction, null);
      assert.strictEqual(filters.method, null);
      assert.strictEqual(filters.jsonrpcMethod, null);
      assert.strictEqual(filters.statusCode, null);
      assert.strictEqual(filters.jsonrpcId, null);
      assert.strictEqual(filters.search, null);
      assert.strictEqual(filters.serverName, null);
      assert.strictEqual(filters.startTime, null);
      assert.strictEqual(filters.endTime, null);
      assert.ok(filters.limit > 0);
      assert.strictEqual(filters.offset, 0);
    });

    test('sets values from data', () => {
      const filters = new RequestFilters({
        sessionId: 'sess-1',
        direction: 'request',
        method: 'POST',
        jsonrpcMethod: 'tools/call',
        statusCode: 200,
        jsonrpcId: 'rpc-1',
        search: 'query',
        serverName: 'my-server',
        startTime: '1000000',
        endTime: '2000000',
        limit: 50,
        offset: 10,
      });

      assert.strictEqual(filters.sessionId, 'sess-1');
      assert.strictEqual(filters.direction, 'request');
      assert.strictEqual(filters.method, 'POST');
      assert.strictEqual(filters.jsonrpcMethod, 'tools/call');
      assert.strictEqual(filters.statusCode, 200);
      assert.strictEqual(filters.jsonrpcId, 'rpc-1');
      assert.strictEqual(filters.search, 'query');
      assert.strictEqual(filters.serverName, 'my-server');
      assert.strictEqual(filters.startTime, '1000000');
      assert.strictEqual(filters.endTime, '2000000');
      assert.strictEqual(filters.limit, 50);
      assert.strictEqual(filters.offset, 10);
    });

    test('parses string limit and offset', () => {
      const filters = new RequestFilters({ limit: '100', offset: '20' });

      assert.strictEqual(filters.limit, 100);
      assert.strictEqual(filters.offset, 20);
    });
  });

  describe('toRepositoryFilters', () => {
    test('converts to repository format', () => {
      const filters = new RequestFilters({
        sessionId: 'sess-1',
        direction: 'request',
        limit: 50,
        offset: 10,
      });

      const repoFilters = filters.toRepositoryFilters();

      assert.strictEqual(repoFilters.sessionId, 'sess-1');
      assert.strictEqual(repoFilters.direction, 'request');
      assert.strictEqual(repoFilters.limit, 50);
      assert.strictEqual(repoFilters.offset, 10);
    });

    test('converts timestamps to BigInt', () => {
      const filters = new RequestFilters({
        startTime: '1000000000000',
        endTime: '2000000000000',
      });

      const repoFilters = filters.toRepositoryFilters();

      assert.strictEqual(typeof repoFilters.startTime, 'bigint');
      assert.strictEqual(typeof repoFilters.endTime, 'bigint');
    });

    test('keeps null timestamps as null', () => {
      const filters = new RequestFilters();
      const repoFilters = filters.toRepositoryFilters();

      assert.strictEqual(repoFilters.startTime, null);
      assert.strictEqual(repoFilters.endTime, null);
    });
  });
});
