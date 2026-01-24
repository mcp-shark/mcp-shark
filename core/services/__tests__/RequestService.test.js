import assert from 'node:assert';
import { afterEach, beforeEach, describe, test } from 'node:test';
import Database from 'better-sqlite3';
import { RequestFilters } from '../../models/RequestFilters.js';
import { AuditRepository } from '../../repositories/AuditRepository.js';
import { PacketRepository } from '../../repositories/PacketRepository.js';
import { SchemaRepository } from '../../repositories/SchemaRepository.js';
import { RequestService } from '../RequestService.js';

function createTestPacket(ctx, overrides = {}) {
  return ctx.auditRepo.logRequestPacket({
    method: 'POST',
    url: '/mcp',
    headers: {},
    body: JSON.stringify({ jsonrpc: '2.0', method: 'test', id: 1 }),
    sessionId: 'test-session',
    ...overrides,
  });
}

describe('RequestService', () => {
  const ctx = {};

  beforeEach(() => {
    ctx.db = new Database(':memory:');
    new SchemaRepository(ctx.db).createSchema();
    ctx.packetRepo = new PacketRepository(ctx.db);
    ctx.auditRepo = new AuditRepository(ctx.db);
    ctx.service = new RequestService(ctx.packetRepo);
  });

  afterEach(() => {
    ctx.db.close();
  });

  describe('getRequests', () => {
    test('returns requests with filters', () => {
      createTestPacket(ctx);
      createTestPacket(ctx);

      const filters = new RequestFilters({ limit: 10 });
      const requests = ctx.service.getRequests(filters);

      assert.strictEqual(requests.length, 2);
    });

    test('respects limit in filters', () => {
      createTestPacket(ctx);
      createTestPacket(ctx);
      createTestPacket(ctx);

      const filters = new RequestFilters({ limit: 2 });
      const requests = ctx.service.getRequests(filters);

      assert.strictEqual(requests.length, 2);
    });
  });

  describe('getRequest', () => {
    test('returns request by frame number', () => {
      const result = createTestPacket(ctx);
      const request = ctx.service.getRequest(result.frameNumber);

      assert.strictEqual(request.frame_number, result.frameNumber);
    });

    test('returns undefined for non-existent frame', () => {
      const request = ctx.service.getRequest(9999);
      assert.strictEqual(request, undefined);
    });

    test('parses string frame number', () => {
      const result = createTestPacket(ctx);
      const request = ctx.service.getRequest(String(result.frameNumber));

      assert.strictEqual(request.frame_number, result.frameNumber);
    });
  });

  describe('clearRequests', () => {
    test('clears all requests', () => {
      createTestPacket(ctx);
      createTestPacket(ctx);

      const result = ctx.service.clearRequests();
      assert.ok(result.clearedTables.includes('packets'));

      const filters = new RequestFilters({ limit: 10 });
      const requests = ctx.service.getRequests(filters);
      assert.strictEqual(requests.length, 0);
    });
  });

  describe('getRequestsForExport', () => {
    test('returns requests without limit restriction', () => {
      createTestPacket(ctx);
      createTestPacket(ctx);
      createTestPacket(ctx);

      const filters = new RequestFilters({});
      const requests = ctx.service.getRequestsForExport(filters);

      assert.ok(requests.length >= 3);
    });
  });
});
