import assert from 'node:assert';
import { afterEach, beforeEach, describe, test } from 'node:test';
import Database from 'better-sqlite3';
import { RequestFilters } from '../../models/RequestFilters.js';
import { AuditRepository } from '../../repositories/AuditRepository.js';
import { ConversationRepository } from '../../repositories/ConversationRepository.js';
import { PacketRepository } from '../../repositories/PacketRepository.js';
import { SchemaRepository } from '../../repositories/SchemaRepository.js';
import { StatisticsRepository } from '../../repositories/StatisticsRepository.js';
import { StatisticsService } from '../StatisticsService.js';

function createRequest(ctx, sessionId = 'sess-1') {
  return ctx.auditRepo.logRequestPacket({
    method: 'POST',
    url: '/mcp',
    headers: {},
    body: JSON.stringify({ jsonrpc: '2.0', method: 'test', id: 1 }),
    sessionId,
  });
}

function createResponse(ctx, statusCode = 200) {
  return ctx.auditRepo.logResponsePacket({
    statusCode,
    headers: {},
    body: JSON.stringify({ jsonrpc: '2.0', result: {}, id: 1 }),
  });
}

describe('StatisticsService', () => {
  const ctx = {};

  beforeEach(() => {
    ctx.db = new Database(':memory:');
    new SchemaRepository(ctx.db).createSchema();
    const statisticsRepo = new StatisticsRepository(ctx.db);
    const packetRepo = new PacketRepository(ctx.db);
    const conversationRepo = new ConversationRepository(ctx.db);
    ctx.auditRepo = new AuditRepository(ctx.db);
    ctx.service = new StatisticsService(statisticsRepo, packetRepo, conversationRepo);
  });

  afterEach(() => {
    ctx.db.close();
  });

  describe('getStatistics', () => {
    test('returns zero counts when no packets', () => {
      const filters = new RequestFilters({});
      const stats = ctx.service.getStatistics(filters);

      assert.strictEqual(stats.total_packets, 0);
      assert.strictEqual(stats.total_requests, 0);
      assert.strictEqual(stats.total_responses, 0);
      assert.strictEqual(stats.total_errors, 0);
      assert.strictEqual(stats.unique_sessions, 0);
    });

    test('counts requests and responses correctly', () => {
      createRequest(ctx, 'sess-1');
      createRequest(ctx, 'sess-1');
      createResponse(ctx, 200);

      const filters = new RequestFilters({});
      const stats = ctx.service.getStatistics(filters);

      assert.strictEqual(stats.total_packets, 3);
      assert.strictEqual(stats.total_requests, 2);
      assert.strictEqual(stats.total_responses, 1);
    });

    test('counts errors correctly', () => {
      createResponse(ctx, 200);
      createResponse(ctx, 400);
      createResponse(ctx, 500);

      const filters = new RequestFilters({});
      const stats = ctx.service.getStatistics(filters);

      assert.strictEqual(stats.total_errors, 2);
    });

    test('counts unique sessions', () => {
      createRequest(ctx, 'sess-1');
      createRequest(ctx, 'sess-1');
      createRequest(ctx, 'sess-2');

      const filters = new RequestFilters({});
      const stats = ctx.service.getStatistics(filters);

      assert.strictEqual(stats.unique_sessions, 2);
    });
  });
});
