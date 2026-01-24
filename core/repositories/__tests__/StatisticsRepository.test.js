import assert from 'node:assert';
import { afterEach, beforeEach, describe, test } from 'node:test';
import Database from 'better-sqlite3';
import { AuditRepository } from '../AuditRepository.js';
import { SchemaRepository } from '../SchemaRepository.js';
import { StatisticsRepository } from '../StatisticsRepository.js';

function createTestRequest(overrides = {}) {
  return {
    method: 'POST',
    url: '/mcp/test',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'tools/call', id: 1 }),
    sessionId: 'test-session',
    ...overrides,
  };
}

describe('StatisticsRepository', () => {
  const ctx = {};

  beforeEach(() => {
    ctx.db = new Database(':memory:');
    const schemaRepo = new SchemaRepository(ctx.db);
    schemaRepo.createSchema();
    ctx.repo = new StatisticsRepository(ctx.db);
    ctx.auditRepo = new AuditRepository(ctx.db);
  });

  afterEach(() => {
    ctx.db.close();
  });

  describe('getStatistics', () => {
    test('returns zero counts when no packets', () => {
      const stats = ctx.repo.getStatistics();
      assert.strictEqual(stats.total_packets, 0);
      assert.strictEqual(stats.total_requests, 0);
      assert.strictEqual(stats.total_responses, 0);
      assert.strictEqual(stats.total_errors, 0);
      assert.strictEqual(stats.unique_sessions, 0);
    });

    test('counts requests and responses correctly', () => {
      ctx.auditRepo.logRequestPacket(createTestRequest());
      ctx.auditRepo.logRequestPacket(createTestRequest());
      ctx.auditRepo.logResponsePacket({ statusCode: 200, headers: {}, body: '{}' });

      const stats = ctx.repo.getStatistics();
      assert.strictEqual(stats.total_packets, 3);
      assert.strictEqual(stats.total_requests, 2);
      assert.strictEqual(stats.total_responses, 1);
    });

    test('counts errors correctly', () => {
      ctx.auditRepo.logResponsePacket({ statusCode: 200, headers: {}, body: '{}' });
      ctx.auditRepo.logResponsePacket({ statusCode: 400, headers: {}, body: '{}' });
      ctx.auditRepo.logResponsePacket({ statusCode: 500, headers: {}, body: '{}' });

      const stats = ctx.repo.getStatistics();
      assert.strictEqual(stats.total_errors, 2);
    });

    test('counts unique sessions', () => {
      ctx.auditRepo.logRequestPacket(createTestRequest({ sessionId: 'sess-1' }));
      ctx.auditRepo.logRequestPacket(createTestRequest({ sessionId: 'sess-1' }));
      ctx.auditRepo.logRequestPacket(createTestRequest({ sessionId: 'sess-2' }));

      const stats = ctx.repo.getStatistics();
      assert.strictEqual(stats.unique_sessions, 2);
    });

    test('calculates total bytes', () => {
      ctx.auditRepo.logRequestPacket(createTestRequest());
      ctx.auditRepo.logRequestPacket(createTestRequest());

      const stats = ctx.repo.getStatistics();
      assert.ok(stats.total_bytes > 0);
    });

    test('tracks first and last packet timestamps', () => {
      ctx.auditRepo.logRequestPacket(createTestRequest());
      ctx.auditRepo.logRequestPacket(createTestRequest());

      const stats = ctx.repo.getStatistics();
      assert.ok(stats.first_packet_ns > 0);
      assert.ok(stats.last_packet_ns > 0);
      assert.ok(stats.first_packet_ns <= stats.last_packet_ns);
    });

    test('filters by sessionId', () => {
      ctx.auditRepo.logRequestPacket(createTestRequest({ sessionId: 'sess-1' }));
      ctx.auditRepo.logRequestPacket(createTestRequest({ sessionId: 'sess-2' }));

      const stats = ctx.repo.getStatistics({ sessionId: 'sess-1' });
      assert.strictEqual(stats.total_packets, 1);
      assert.strictEqual(stats.unique_sessions, 1);
    });

    test('filters by time range', () => {
      const result1 = ctx.auditRepo.logRequestPacket(createTestRequest());
      ctx.auditRepo.logRequestPacket(createTestRequest());
      const result2 = ctx.auditRepo.logRequestPacket(createTestRequest());

      const stats = ctx.repo.getStatistics({
        startTime: result1.timestampNs,
        endTime: result2.timestampNs,
      });
      assert.strictEqual(stats.total_packets, 3);
    });
  });
});
