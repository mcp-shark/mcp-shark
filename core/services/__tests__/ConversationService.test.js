import assert from 'node:assert';
import { afterEach, beforeEach, describe, test } from 'node:test';
import Database from 'better-sqlite3';
import { ConversationFilters } from '../../models/ConversationFilters.js';
import { AuditRepository } from '../../repositories/AuditRepository.js';
import { ConversationRepository } from '../../repositories/ConversationRepository.js';
import { SchemaRepository } from '../../repositories/SchemaRepository.js';
import { ConversationService } from '../ConversationService.js';

function createPacket(ctx, sessionId = 'sess-1') {
  const result = ctx.auditRepo.logRequestPacket({
    method: 'POST',
    url: '/mcp',
    headers: {},
    body: JSON.stringify({ jsonrpc: '2.0', method: 'test', id: 1 }),
    sessionId,
  });
  return result.frameNumber;
}

describe('ConversationService', () => {
  const ctx = {};

  beforeEach(() => {
    ctx.db = new Database(':memory:');
    new SchemaRepository(ctx.db).createSchema();
    ctx.conversationRepo = new ConversationRepository(ctx.db);
    ctx.auditRepo = new AuditRepository(ctx.db);
    ctx.service = new ConversationService(ctx.conversationRepo);
  });

  afterEach(() => {
    ctx.db.close();
  });

  describe('getConversations', () => {
    test('returns conversations with filters', () => {
      const frame1 = createPacket(ctx);
      const frame2 = createPacket(ctx);
      const now = Date.now() * 1_000_000;

      ctx.conversationRepo.createConversation(frame1, 'sess-1', 'rpc-1', 'tools/call', now);
      ctx.conversationRepo.createConversation(
        frame2,
        'sess-1',
        'rpc-2',
        'tools/list',
        now + 1_000_000
      );

      const filters = new ConversationFilters({ limit: 10 });
      const conversations = ctx.service.getConversations(filters);

      assert.strictEqual(conversations.length, 2);
    });

    test('filters by session ID', () => {
      const frame1 = createPacket(ctx, 'sess-1');
      const frame2 = createPacket(ctx, 'sess-2');
      const now = Date.now() * 1_000_000;

      ctx.conversationRepo.createConversation(frame1, 'sess-1', 'rpc-1', 'method1', now);
      ctx.conversationRepo.createConversation(
        frame2,
        'sess-2',
        'rpc-2',
        'method2',
        now + 1_000_000
      );

      const filters = new ConversationFilters({ sessionId: 'sess-1', limit: 10 });
      const conversations = ctx.service.getConversations(filters);

      assert.strictEqual(conversations.length, 1);
      assert.strictEqual(conversations[0].session_id, 'sess-1');
    });

    test('filters by method', () => {
      const frame1 = createPacket(ctx);
      const frame2 = createPacket(ctx);
      const now = Date.now() * 1_000_000;

      ctx.conversationRepo.createConversation(frame1, 'sess-1', 'rpc-1', 'tools/call', now);
      ctx.conversationRepo.createConversation(
        frame2,
        'sess-1',
        'rpc-2',
        'tools/list',
        now + 1_000_000
      );

      const filters = new ConversationFilters({ method: 'tools/call', limit: 10 });
      const conversations = ctx.service.getConversations(filters);

      assert.strictEqual(conversations.length, 1);
      assert.strictEqual(conversations[0].method, 'tools/call');
    });
  });
});
