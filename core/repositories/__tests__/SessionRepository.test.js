import assert from 'node:assert';
import { afterEach, beforeEach, describe, test } from 'node:test';
import Database from 'better-sqlite3';
import { SchemaRepository } from '../SchemaRepository.js';
import { SessionRepository } from '../SessionRepository.js';

describe('SessionRepository', () => {
  const ctx = {};

  beforeEach(() => {
    ctx.db = new Database(':memory:');
    const schemaRepo = new SchemaRepository(ctx.db);
    schemaRepo.createSchema();
    ctx.repo = new SessionRepository(ctx.db);
  });

  afterEach(() => {
    ctx.db.close();
  });

  describe('upsertSession', () => {
    test('creates a new session', () => {
      const timestampNs = Date.now() * 1_000_000;
      ctx.repo.upsertSession('sess-1', timestampNs, 'Mozilla/5.0', '127.0.0.1', 'localhost');

      const sessions = ctx.repo.getSessions();
      assert.strictEqual(sessions.length, 1);
      assert.strictEqual(sessions[0].session_id, 'sess-1');
      assert.strictEqual(sessions[0].user_agent, 'Mozilla/5.0');
      assert.strictEqual(sessions[0].remote_address, '127.0.0.1');
      assert.strictEqual(sessions[0].host, 'localhost');
      assert.strictEqual(sessions[0].packet_count, 1);
    });

    test('updates existing session and increments packet count', () => {
      const timestampNs1 = Date.now() * 1_000_000;
      const timestampNs2 = timestampNs1 + 1_000_000;

      ctx.repo.upsertSession('sess-1', timestampNs1, 'Mozilla/5.0', '127.0.0.1', 'localhost');
      ctx.repo.upsertSession('sess-1', timestampNs2, 'Mozilla/5.0', '127.0.0.1', 'localhost');

      const sessions = ctx.repo.getSessions();
      assert.strictEqual(sessions.length, 1);
      assert.strictEqual(sessions[0].packet_count, 2);
    });

    test('preserves existing values when new values are null', () => {
      const timestampNs1 = Date.now() * 1_000_000;
      const timestampNs2 = timestampNs1 + 1_000_000;

      ctx.repo.upsertSession('sess-1', timestampNs1, 'Mozilla/5.0', '127.0.0.1', 'localhost');
      ctx.repo.upsertSession('sess-1', timestampNs2, null, null, null);

      const sessions = ctx.repo.getSessions();
      assert.strictEqual(sessions[0].user_agent, 'Mozilla/5.0');
      assert.strictEqual(sessions[0].remote_address, '127.0.0.1');
      assert.strictEqual(sessions[0].host, 'localhost');
    });
  });

  describe('getSessions', () => {
    test('returns empty array when no sessions', () => {
      const sessions = ctx.repo.getSessions();
      assert.strictEqual(sessions.length, 0);
    });

    test('returns sessions ordered by first_seen_ns DESC', () => {
      const now = Date.now() * 1_000_000;
      ctx.repo.upsertSession('sess-1', now, null, null, null);
      ctx.repo.upsertSession('sess-2', now + 1_000_000, null, null, null);

      const sessions = ctx.repo.getSessions();
      assert.strictEqual(sessions.length, 2);
      assert.strictEqual(sessions[0].session_id, 'sess-2');
      assert.strictEqual(sessions[1].session_id, 'sess-1');
    });

    test('filters by startTime', () => {
      const now = Date.now() * 1_000_000;
      ctx.repo.upsertSession('sess-1', now, null, null, null);
      ctx.repo.upsertSession('sess-2', now + 2_000_000, null, null, null);

      const sessions = ctx.repo.getSessions({ startTime: now + 1_000_000 });
      assert.strictEqual(sessions.length, 1);
      assert.strictEqual(sessions[0].session_id, 'sess-2');
    });

    test('filters by endTime', () => {
      const now = Date.now() * 1_000_000;
      ctx.repo.upsertSession('sess-1', now, null, null, null);
      ctx.repo.upsertSession('sess-2', now + 2_000_000, null, null, null);

      const sessions = ctx.repo.getSessions({ endTime: now + 1_000_000 });
      assert.strictEqual(sessions.length, 1);
      assert.strictEqual(sessions[0].session_id, 'sess-1');
    });

    test('respects limit and offset', () => {
      const now = Date.now() * 1_000_000;
      ctx.repo.upsertSession('sess-1', now, null, null, null);
      ctx.repo.upsertSession('sess-2', now + 1_000_000, null, null, null);
      ctx.repo.upsertSession('sess-3', now + 2_000_000, null, null, null);

      const sessions = ctx.repo.getSessions({ limit: 2, offset: 1 });
      assert.strictEqual(sessions.length, 2);
      assert.strictEqual(sessions[0].session_id, 'sess-2');
      assert.strictEqual(sessions[1].session_id, 'sess-1');
    });
  });
});
