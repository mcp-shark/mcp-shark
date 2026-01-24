import assert from 'node:assert';
import { afterEach, beforeEach, describe, test } from 'node:test';
import Database from 'better-sqlite3';
import { AuditRepository } from '../AuditRepository.js';
import { PacketRepository } from '../PacketRepository.js';
import { SchemaRepository } from '../SchemaRepository.js';

function createTestPacket(overrides = {}) {
  const defaults = {
    method: 'POST',
    url: '/mcp/test',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'tools/call', id: 1 }),
    sessionId: 'test-session',
  };
  return { ...defaults, ...overrides };
}

describe('PacketRepository', () => {
  const ctx = {};

  beforeEach(() => {
    ctx.db = new Database(':memory:');
    const schemaRepo = new SchemaRepository(ctx.db);
    schemaRepo.createSchema();
    ctx.repo = new PacketRepository(ctx.db);
    ctx.auditRepo = new AuditRepository(ctx.db);
  });

  afterEach(() => {
    ctx.db.close();
  });

  describe('queryPackets', () => {
    test('returns empty array when no packets', () => {
      const packets = ctx.repo.queryPackets();
      assert.strictEqual(packets.length, 0);
    });

    test('returns all packets ordered by timestamp ASC', () => {
      const packet1 = createTestPacket();
      const packet2 = createTestPacket();
      ctx.auditRepo.logRequestPacket(packet1);
      ctx.auditRepo.logRequestPacket(packet2);

      const packets = ctx.repo.queryPackets();
      assert.strictEqual(packets.length, 2);
      assert.ok(packets[0].timestamp_ns <= packets[1].timestamp_ns);
    });

    test('filters by sessionId', () => {
      ctx.auditRepo.logRequestPacket(createTestPacket({ sessionId: 'sess-1' }));
      ctx.auditRepo.logRequestPacket(createTestPacket({ sessionId: 'sess-2' }));

      const packets = ctx.repo.queryPackets({ sessionId: 'sess-1' });
      assert.strictEqual(packets.length, 1);
      assert.strictEqual(packets[0].session_id, 'sess-1');
    });

    test('filters by direction', () => {
      ctx.auditRepo.logRequestPacket(createTestPacket());
      ctx.auditRepo.logResponsePacket({ statusCode: 200, headers: {}, body: '{}' });

      const packets = ctx.repo.queryPackets({ direction: 'request' });
      assert.strictEqual(packets.length, 1);
      assert.strictEqual(packets[0].direction, 'request');
    });

    test('filters by method', () => {
      ctx.auditRepo.logRequestPacket(createTestPacket({ method: 'GET' }));
      ctx.auditRepo.logRequestPacket(createTestPacket({ method: 'POST' }));

      const packets = ctx.repo.queryPackets({ method: 'GET' });
      assert.strictEqual(packets.length, 1);
      assert.strictEqual(packets[0].method, 'GET');
    });

    test('filters by statusCode', () => {
      ctx.auditRepo.logResponsePacket({ statusCode: 200, headers: {}, body: '{}' });
      ctx.auditRepo.logResponsePacket({ statusCode: 404, headers: {}, body: '{}' });

      const packets = ctx.repo.queryPackets({ statusCode: 200 });
      assert.strictEqual(packets.length, 1);
      assert.strictEqual(packets[0].status_code, 200);
    });

    test('respects limit and offset', () => {
      ctx.auditRepo.logRequestPacket(createTestPacket());
      ctx.auditRepo.logRequestPacket(createTestPacket());
      ctx.auditRepo.logRequestPacket(createTestPacket());

      const packets = ctx.repo.queryPackets({ limit: 2, offset: 1 });
      assert.strictEqual(packets.length, 2);
    });
  });

  describe('queryRequests', () => {
    test('filters by search term', () => {
      ctx.auditRepo.logRequestPacket(createTestPacket({ url: '/mcp/special-endpoint' }));
      ctx.auditRepo.logRequestPacket(createTestPacket({ url: '/mcp/other' }));

      const packets = ctx.repo.queryRequests({ search: 'special' });
      assert.strictEqual(packets.length, 1);
      assert.ok(packets[0].url.includes('special'));
    });

    test('filters by serverName', () => {
      ctx.auditRepo.logRequestPacket(
        createTestPacket({
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'tools/call',
            params: { name: 'myserver.tool' },
          }),
        })
      );
      ctx.auditRepo.logRequestPacket(
        createTestPacket({ body: JSON.stringify({ jsonrpc: '2.0', method: 'test' }) })
      );

      const packets = ctx.repo.queryRequests({ serverName: 'myserver' });
      assert.strictEqual(packets.length, 1);
    });

    test('returns packets ordered by timestamp DESC', () => {
      ctx.auditRepo.logRequestPacket(createTestPacket());
      ctx.auditRepo.logRequestPacket(createTestPacket());

      const packets = ctx.repo.queryRequests();
      assert.strictEqual(packets.length, 2);
      assert.ok(packets[0].timestamp_ns >= packets[1].timestamp_ns);
    });
  });

  describe('getByFrameNumber', () => {
    test('returns packet by frame number', () => {
      const result = ctx.auditRepo.logRequestPacket(createTestPacket());

      const packet = ctx.repo.getByFrameNumber(result.frameNumber);
      assert.strictEqual(packet.frame_number, result.frameNumber);
    });

    test('returns undefined for non-existent frame number', () => {
      const packet = ctx.repo.getByFrameNumber(999);
      assert.strictEqual(packet, undefined);
    });
  });

  describe('getSessionPackets', () => {
    test('returns packets for a session ordered by timestamp ASC', () => {
      ctx.auditRepo.logRequestPacket(createTestPacket({ sessionId: 'sess-1' }));
      ctx.auditRepo.logRequestPacket(createTestPacket({ sessionId: 'sess-1' }));
      ctx.auditRepo.logRequestPacket(createTestPacket({ sessionId: 'sess-2' }));

      const packets = ctx.repo.getSessionPackets('sess-1');
      assert.strictEqual(packets.length, 2);
      assert.ok(packets[0].timestamp_ns <= packets[1].timestamp_ns);
    });

    test('respects limit parameter', () => {
      ctx.auditRepo.logRequestPacket(createTestPacket({ sessionId: 'sess-1' }));
      ctx.auditRepo.logRequestPacket(createTestPacket({ sessionId: 'sess-1' }));
      ctx.auditRepo.logRequestPacket(createTestPacket({ sessionId: 'sess-1' }));

      const packets = ctx.repo.getSessionPackets('sess-1', 2);
      assert.strictEqual(packets.length, 2);
    });
  });

  describe('getSessionRequests', () => {
    test('returns packets for a session ordered by timestamp DESC', () => {
      ctx.auditRepo.logRequestPacket(createTestPacket({ sessionId: 'sess-1' }));
      ctx.auditRepo.logRequestPacket(createTestPacket({ sessionId: 'sess-1' }));

      const packets = ctx.repo.getSessionRequests('sess-1');
      assert.strictEqual(packets.length, 2);
      assert.ok(packets[0].timestamp_ns >= packets[1].timestamp_ns);
    });
  });

  describe('clearAll', () => {
    test('clears all traffic tables', () => {
      ctx.auditRepo.logRequestPacket(createTestPacket());
      ctx.auditRepo.logResponsePacket({ statusCode: 200, headers: {}, body: '{}' });

      const result = ctx.repo.clearAll();
      assert.ok(result.clearedTables.includes('packets'));

      const packets = ctx.repo.queryPackets();
      assert.strictEqual(packets.length, 0);
    });
  });

  describe('getMaxTimestamp', () => {
    test('returns max timestamp', () => {
      ctx.auditRepo.logRequestPacket(createTestPacket());
      ctx.auditRepo.logRequestPacket(createTestPacket());

      const result = ctx.repo.getMaxTimestamp();
      assert.ok(result.max_ts > 0);
    });

    test('returns null when no packets', () => {
      const result = ctx.repo.getMaxTimestamp();
      assert.strictEqual(result.max_ts, null);
    });
  });
});
