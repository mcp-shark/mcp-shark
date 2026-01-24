import assert from 'node:assert';
import { afterEach, beforeEach, describe, test } from 'node:test';
import Database from 'better-sqlite3';
import { AuditRepository } from '../AuditRepository.js';
import { ConversationRepository } from '../ConversationRepository.js';
import { SchemaRepository } from '../SchemaRepository.js';

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

describe('ConversationRepository', () => {
  const ctx = {};

  beforeEach(() => {
    ctx.db = new Database(':memory:');
    const schemaRepo = new SchemaRepository(ctx.db);
    schemaRepo.createSchema();
    ctx.repo = new ConversationRepository(ctx.db);
    ctx.auditRepo = new AuditRepository(ctx.db);
  });

  afterEach(() => {
    ctx.db.close();
  });

  describe('createConversation', () => {
    test('creates a new conversation with pending status', () => {
      const frameNumber = createPacket(ctx);
      const timestampNs = Date.now() * 1_000_000;
      ctx.repo.createConversation(frameNumber, 'sess-1', 'rpc-1', 'tools/call', timestampNs);

      const conversations = ctx.repo.queryConversations();
      assert.strictEqual(conversations.length, 1);
      assert.strictEqual(conversations[0].request_frame_number, frameNumber);
      assert.strictEqual(conversations[0].session_id, 'sess-1');
      assert.strictEqual(conversations[0].jsonrpc_id, 'rpc-1');
      assert.strictEqual(conversations[0].method, 'tools/call');
      assert.strictEqual(conversations[0].status, 'pending');
    });
  });

  describe('updateConversationWithResponse', () => {
    test('updates conversation with response data', () => {
      const reqFrame = createPacket(ctx);
      const respFrame = createPacket(ctx);
      const reqTimestampNs = Date.now() * 1_000_000;
      const respTimestampNs = reqTimestampNs + 100_000_000;
      const durationMs = 100;

      ctx.repo.createConversation(reqFrame, 'sess-1', 'rpc-1', 'tools/call', reqTimestampNs);
      ctx.repo.updateConversationWithResponse(
        reqFrame,
        respFrame,
        respTimestampNs,
        durationMs,
        'completed'
      );

      const conversations = ctx.repo.queryConversations();
      assert.strictEqual(conversations[0].response_frame_number, respFrame);
      assert.strictEqual(conversations[0].duration_ms, durationMs);
      assert.strictEqual(conversations[0].status, 'completed');
    });
  });

  describe('findConversationByJsonRpcId', () => {
    test('finds pending conversation by JSON-RPC ID', () => {
      const frameNumber = createPacket(ctx);
      const timestampNs = Date.now() * 1_000_000;
      ctx.repo.createConversation(frameNumber, 'sess-1', 'rpc-123', 'tools/call', timestampNs);

      const conv = ctx.repo.findConversationByJsonRpcId('rpc-123');
      assert.strictEqual(conv.request_frame_number, frameNumber);
    });

    test('returns undefined for non-existent ID', () => {
      const conv = ctx.repo.findConversationByJsonRpcId('non-existent');
      assert.strictEqual(conv, undefined);
    });

    test('does not find completed conversations', () => {
      const reqFrame = createPacket(ctx);
      const respFrame = createPacket(ctx);
      const timestampNs = Date.now() * 1_000_000;
      ctx.repo.createConversation(reqFrame, 'sess-1', 'rpc-123', 'tools/call', timestampNs);
      ctx.repo.updateConversationWithResponse(
        reqFrame,
        respFrame,
        timestampNs + 100_000_000,
        100,
        'completed'
      );

      const conv = ctx.repo.findConversationByJsonRpcId('rpc-123');
      assert.strictEqual(conv, undefined);
    });
  });

  describe('queryConversations', () => {
    test('returns empty array when no conversations', () => {
      const conversations = ctx.repo.queryConversations();
      assert.strictEqual(conversations.length, 0);
    });

    test('filters by sessionId', () => {
      const frame1 = createPacket(ctx, 'sess-1');
      const frame2 = createPacket(ctx, 'sess-2');
      const now = Date.now() * 1_000_000;
      ctx.repo.createConversation(frame1, 'sess-1', 'rpc-1', 'method1', now);
      ctx.repo.createConversation(frame2, 'sess-2', 'rpc-2', 'method2', now + 1_000_000);

      const conversations = ctx.repo.queryConversations({ sessionId: 'sess-1' });
      assert.strictEqual(conversations.length, 1);
      assert.strictEqual(conversations[0].session_id, 'sess-1');
    });

    test('filters by method', () => {
      const frame1 = createPacket(ctx);
      const frame2 = createPacket(ctx);
      const now = Date.now() * 1_000_000;
      ctx.repo.createConversation(frame1, 'sess-1', 'rpc-1', 'tools/call', now);
      ctx.repo.createConversation(frame2, 'sess-1', 'rpc-2', 'tools/list', now + 1_000_000);

      const conversations = ctx.repo.queryConversations({ method: 'tools/call' });
      assert.strictEqual(conversations.length, 1);
      assert.strictEqual(conversations[0].method, 'tools/call');
    });

    test('filters by status', () => {
      const frame1 = createPacket(ctx);
      const frame2 = createPacket(ctx);
      const respFrame = createPacket(ctx);
      const now = Date.now() * 1_000_000;
      ctx.repo.createConversation(frame1, 'sess-1', 'rpc-1', 'method1', now);
      ctx.repo.createConversation(frame2, 'sess-1', 'rpc-2', 'method2', now + 1_000_000);
      ctx.repo.updateConversationWithResponse(frame1, respFrame, now + 50_000_000, 50, 'completed');

      const conversations = ctx.repo.queryConversations({ status: 'completed' });
      assert.strictEqual(conversations.length, 1);
      assert.strictEqual(conversations[0].jsonrpc_id, 'rpc-1');
    });

    test('filters by startTime and endTime', () => {
      const frame1 = createPacket(ctx);
      const frame2 = createPacket(ctx);
      const frame3 = createPacket(ctx);
      const now = Date.now() * 1_000_000;
      ctx.repo.createConversation(frame1, 'sess-1', 'rpc-1', 'method1', now);
      ctx.repo.createConversation(frame2, 'sess-1', 'rpc-2', 'method2', now + 2_000_000);
      ctx.repo.createConversation(frame3, 'sess-1', 'rpc-3', 'method3', now + 4_000_000);

      const conversations = ctx.repo.queryConversations({
        startTime: now + 1_000_000,
        endTime: now + 3_000_000,
      });
      assert.strictEqual(conversations.length, 1);
      assert.strictEqual(conversations[0].jsonrpc_id, 'rpc-2');
    });

    test('filters by jsonrpcId', () => {
      const frame1 = createPacket(ctx);
      const frame2 = createPacket(ctx);
      const now = Date.now() * 1_000_000;
      ctx.repo.createConversation(frame1, 'sess-1', 'rpc-123', 'method1', now);
      ctx.repo.createConversation(frame2, 'sess-1', 'rpc-456', 'method2', now + 1_000_000);

      const conversations = ctx.repo.queryConversations({ jsonrpcId: 'rpc-123' });
      assert.strictEqual(conversations.length, 1);
      assert.strictEqual(conversations[0].jsonrpc_id, 'rpc-123');
    });

    test('respects limit and offset', () => {
      const frame1 = createPacket(ctx);
      const frame2 = createPacket(ctx);
      const frame3 = createPacket(ctx);
      const now = Date.now() * 1_000_000;
      ctx.repo.createConversation(frame1, 'sess-1', 'rpc-1', 'method1', now);
      ctx.repo.createConversation(frame2, 'sess-1', 'rpc-2', 'method2', now + 1_000_000);
      ctx.repo.createConversation(frame3, 'sess-1', 'rpc-3', 'method3', now + 2_000_000);

      const conversations = ctx.repo.queryConversations({ limit: 2, offset: 1 });
      assert.strictEqual(conversations.length, 2);
      assert.strictEqual(conversations[0].jsonrpc_id, 'rpc-2');
    });
  });

  describe('getConversationStatistics', () => {
    test('returns correct statistics', () => {
      const frame1 = createPacket(ctx, 'sess-1');
      const frame2 = createPacket(ctx, 'sess-1');
      const frame3 = createPacket(ctx, 'sess-2');
      const respFrame1 = createPacket(ctx);
      const respFrame2 = createPacket(ctx);
      const now = Date.now() * 1_000_000;
      ctx.repo.createConversation(frame1, 'sess-1', 'rpc-1', 'method1', now);
      ctx.repo.createConversation(frame2, 'sess-1', 'rpc-2', 'method2', now + 1_000_000);
      ctx.repo.createConversation(frame3, 'sess-2', 'rpc-3', 'method3', now + 2_000_000);
      ctx.repo.updateConversationWithResponse(
        frame1,
        respFrame1,
        now + 100_000_000,
        100,
        'completed'
      );
      ctx.repo.updateConversationWithResponse(frame2, respFrame2, now + 200_000_000, 200, 'error');

      const stats = ctx.repo.getConversationStatistics();
      assert.strictEqual(stats.total_conversations, 3);
      assert.strictEqual(stats.completed, 1);
      assert.strictEqual(stats.pending, 1);
      assert.strictEqual(stats.errors, 1);
      assert.strictEqual(stats.avg_duration_ms, 150);
      assert.strictEqual(stats.min_duration_ms, 100);
      assert.strictEqual(stats.max_duration_ms, 200);
    });

    test('filters statistics by sessionId', () => {
      const frame1 = createPacket(ctx, 'sess-1');
      const frame2 = createPacket(ctx, 'sess-2');
      const now = Date.now() * 1_000_000;
      ctx.repo.createConversation(frame1, 'sess-1', 'rpc-1', 'method1', now);
      ctx.repo.createConversation(frame2, 'sess-2', 'rpc-2', 'method2', now + 1_000_000);

      const stats = ctx.repo.getConversationStatistics({ sessionId: 'sess-1' });
      assert.strictEqual(stats.total_conversations, 1);
    });

    test('filters statistics by time range', () => {
      const frame1 = createPacket(ctx);
      const frame2 = createPacket(ctx);
      const now = Date.now() * 1_000_000;
      ctx.repo.createConversation(frame1, 'sess-1', 'rpc-1', 'method1', now);
      ctx.repo.createConversation(frame2, 'sess-1', 'rpc-2', 'method2', now + 2_000_000);

      const stats = ctx.repo.getConversationStatistics({
        startTime: now + 1_000_000,
        endTime: now + 3_000_000,
      });
      assert.strictEqual(stats.total_conversations, 1);
    });
  });
});
