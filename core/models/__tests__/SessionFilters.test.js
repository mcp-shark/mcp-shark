import assert from 'node:assert';
import { describe, test } from 'node:test';
import { SessionFilters } from '../SessionFilters.js';

describe('SessionFilters', () => {
  describe('constructor', () => {
    test('sets default values', () => {
      const filters = new SessionFilters();

      assert.strictEqual(filters.startTime, null);
      assert.strictEqual(filters.endTime, null);
      assert.ok(filters.limit > 0);
      assert.strictEqual(filters.offset, 0);
    });

    test('sets values from data', () => {
      const filters = new SessionFilters({
        startTime: '1000000',
        endTime: '2000000',
        limit: 25,
        offset: 5,
      });

      assert.strictEqual(filters.startTime, '1000000');
      assert.strictEqual(filters.endTime, '2000000');
      assert.strictEqual(filters.limit, 25);
      assert.strictEqual(filters.offset, 5);
    });

    test('parses string limit and offset', () => {
      const filters = new SessionFilters({ limit: '50', offset: '10' });

      assert.strictEqual(filters.limit, 50);
      assert.strictEqual(filters.offset, 10);
    });
  });

  describe('toRepositoryFilters', () => {
    test('converts to repository format', () => {
      const filters = new SessionFilters({
        limit: 25,
        offset: 5,
      });

      const repoFilters = filters.toRepositoryFilters();

      assert.strictEqual(repoFilters.limit, 25);
      assert.strictEqual(repoFilters.offset, 5);
    });

    test('converts timestamps to BigInt', () => {
      const filters = new SessionFilters({
        startTime: '1000000000000',
        endTime: '2000000000000',
      });

      const repoFilters = filters.toRepositoryFilters();

      assert.strictEqual(typeof repoFilters.startTime, 'bigint');
      assert.strictEqual(typeof repoFilters.endTime, 'bigint');
    });

    test('keeps null timestamps as null', () => {
      const filters = new SessionFilters();
      const repoFilters = filters.toRepositoryFilters();

      assert.strictEqual(repoFilters.startTime, null);
      assert.strictEqual(repoFilters.endTime, null);
    });
  });
});
