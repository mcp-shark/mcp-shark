import assert from 'node:assert';
import { afterEach, beforeEach, describe, test } from 'node:test';
import Database from 'better-sqlite3';
import { SessionFilters } from '../../models/SessionFilters.js';
import { AuditRepository } from '../../repositories/AuditRepository.js';
import { PacketRepository } from '../../repositories/PacketRepository.js';
import { SchemaRepository } from '../../repositories/SchemaRepository.js';
import { SessionRepository } from '../../repositories/SessionRepository.js';
import { SessionService } from '../SessionService.js';

describe('SessionService', () => {
  const ctx = {};

  beforeEach(() => {
    ctx.db = new Database(':memory:');
    new SchemaRepository(ctx.db).createSchema();
    ctx.sessionRepo = new SessionRepository(ctx.db);
    ctx.packetRepo = new PacketRepository(ctx.db);
    ctx.auditRepo = new AuditRepository(ctx.db);
    ctx.service = new SessionService(ctx.sessionRepo, ctx.packetRepo);
  });

  afterEach(() => {
    ctx.db.close();
  });

  describe('getSessions', () => {
    test('returns sessions with filters', () => {
      const now = Date.now() * 1_000_000;
      ctx.sessionRepo.upsertSession('sess-1', now, 'Mozilla/5.0', '127.0.0.1', 'localhost');
      ctx.sessionRepo.upsertSession(
        'sess-2',
        now + 1_000_000,
        'Chrome',
        '192.168.1.1',
        'example.com'
      );

      const filters = new SessionFilters({ limit: 10 });
      const sessions = ctx.service.getSessions(filters);

      assert.strictEqual(sessions.length, 2);
    });

    test('respects limit and offset in filters', () => {
      const now = Date.now() * 1_000_000;
      ctx.sessionRepo.upsertSession('sess-1', now, null, null, null);
      ctx.sessionRepo.upsertSession('sess-2', now + 1_000_000, null, null, null);
      ctx.sessionRepo.upsertSession('sess-3', now + 2_000_000, null, null, null);

      const filters = new SessionFilters({ limit: 2, offset: 1 });
      const sessions = ctx.service.getSessions(filters);

      assert.strictEqual(sessions.length, 2);
    });
  });

  describe('getSessionRequests', () => {
    test('returns requests for a session', () => {
      ctx.auditRepo.logRequestPacket({
        method: 'POST',
        url: '/mcp',
        headers: {},
        body: '{}',
        sessionId: 'sess-1',
      });
      ctx.auditRepo.logRequestPacket({
        method: 'POST',
        url: '/mcp',
        headers: {},
        body: '{}',
        sessionId: 'sess-1',
      });
      ctx.auditRepo.logRequestPacket({
        method: 'POST',
        url: '/mcp',
        headers: {},
        body: '{}',
        sessionId: 'sess-2',
      });

      const requests = ctx.service.getSessionRequests('sess-1');
      assert.strictEqual(requests.length, 2);
    });

    test('respects limit parameter', () => {
      ctx.auditRepo.logRequestPacket({
        method: 'POST',
        url: '/mcp',
        headers: {},
        body: '{}',
        sessionId: 'sess-1',
      });
      ctx.auditRepo.logRequestPacket({
        method: 'POST',
        url: '/mcp',
        headers: {},
        body: '{}',
        sessionId: 'sess-1',
      });
      ctx.auditRepo.logRequestPacket({
        method: 'POST',
        url: '/mcp',
        headers: {},
        body: '{}',
        sessionId: 'sess-1',
      });

      const requests = ctx.service.getSessionRequests('sess-1', 2);
      assert.strictEqual(requests.length, 2);
    });

    test('parses string limit', () => {
      ctx.auditRepo.logRequestPacket({
        method: 'POST',
        url: '/mcp',
        headers: {},
        body: '{}',
        sessionId: 'sess-1',
      });

      const requests = ctx.service.getSessionRequests('sess-1', '5');
      assert.ok(Array.isArray(requests));
    });
  });
});
