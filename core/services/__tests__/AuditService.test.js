import assert from 'node:assert';
import { afterEach, beforeEach, describe, test } from 'node:test';
import Database from 'better-sqlite3';
import { AuditRepository } from '../../repositories/AuditRepository.js';
import { ConversationRepository } from '../../repositories/ConversationRepository.js';
import { SchemaRepository } from '../../repositories/SchemaRepository.js';
import { SessionRepository } from '../../repositories/SessionRepository.js';
import { AuditService } from '../AuditService.js';

describe('AuditService', () => {
  const ctx = {};

  beforeEach(() => {
    ctx.db = new Database(':memory:');
    new SchemaRepository(ctx.db).createSchema();
    ctx.auditRepo = new AuditRepository(ctx.db);
    ctx.sessionRepo = new SessionRepository(ctx.db);
    ctx.conversationRepo = new ConversationRepository(ctx.db);
    ctx.service = new AuditService(ctx.auditRepo, ctx.sessionRepo, ctx.conversationRepo);
  });

  afterEach(() => {
    ctx.db.close();
  });

  describe('_normalizeSessionId', () => {
    test('extracts session ID from mcp-session-id header', () => {
      const headers = { 'mcp-session-id': 'sess-123' };
      const result = ctx.service._normalizeSessionId(headers);
      assert.strictEqual(result, 'sess-123');
    });

    test('extracts session ID from Mcp-Session-Id header', () => {
      const headers = { 'Mcp-Session-Id': 'sess-456' };
      const result = ctx.service._normalizeSessionId(headers);
      assert.strictEqual(result, 'sess-456');
    });

    test('returns null for missing headers', () => {
      const result = ctx.service._normalizeSessionId(null);
      assert.strictEqual(result, null);
    });

    test('returns null for empty headers', () => {
      const result = ctx.service._normalizeSessionId({});
      assert.strictEqual(result, null);
    });

    test('returns null for non-object headers', () => {
      const result = ctx.service._normalizeSessionId('not an object');
      assert.strictEqual(result, null);
    });
  });

  describe('_calculateDurationMs', () => {
    test('calculates duration correctly', () => {
      const startNs = 1000000000;
      const endNs = 1100000000;
      const result = ctx.service._calculateDurationMs(startNs, endNs);
      assert.strictEqual(result, 100);
    });
  });

  describe('logRequestPacket', () => {
    test('logs request and creates session', () => {
      const result = ctx.service.logRequestPacket({
        method: 'POST',
        url: '/mcp',
        headers: { 'mcp-session-id': 'sess-1', 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'tools/call', id: 1 }),
      });

      assert.ok(result.frameNumber);
      assert.ok(result.timestampNs);

      const sessions = ctx.sessionRepo.getSessions();
      assert.strictEqual(sessions.length, 1);
      assert.strictEqual(sessions[0].session_id, 'sess-1');
    });

    test('creates conversation entry for JSON-RPC request', () => {
      ctx.service.logRequestPacket({
        method: 'POST',
        url: '/mcp',
        headers: { 'mcp-session-id': 'sess-1' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'tools/call', id: 'rpc-1' }),
      });

      const conversations = ctx.conversationRepo.queryConversations();
      assert.strictEqual(conversations.length, 1);
      assert.strictEqual(conversations[0].jsonrpc_id, 'rpc-1');
      assert.strictEqual(conversations[0].status, 'pending');
    });

    test('uses sessionId from options if no header', () => {
      const result = ctx.service.logRequestPacket({
        method: 'POST',
        url: '/mcp',
        headers: {},
        body: '{}',
        sessionId: 'fallback-session',
      });

      assert.strictEqual(result.sessionId, 'fallback-session');
    });
  });

  describe('logResponsePacket', () => {
    test('logs response and updates session', () => {
      ctx.service.logRequestPacket({
        method: 'POST',
        url: '/mcp',
        headers: { 'mcp-session-id': 'sess-1' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'test', id: 1 }),
      });

      const result = ctx.service.logResponsePacket({
        statusCode: 200,
        headers: { 'mcp-session-id': 'sess-1' },
        body: JSON.stringify({ jsonrpc: '2.0', result: {}, id: 1 }),
      });

      assert.ok(result.frameNumber);
      const sessions = ctx.sessionRepo.getSessions();
      assert.strictEqual(sessions[0].packet_count, 2);
    });

    test('updates conversation with response by JSON-RPC ID', () => {
      const reqResult = ctx.service.logRequestPacket({
        method: 'POST',
        url: '/mcp',
        headers: { 'mcp-session-id': 'sess-1' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'test', id: 'rpc-1' }),
      });

      ctx.service.logResponsePacket({
        statusCode: 200,
        headers: { 'mcp-session-id': 'sess-1' },
        body: JSON.stringify({ jsonrpc: '2.0', result: {}, id: 'rpc-1' }),
        requestTimestampNs: reqResult.timestampNs,
      });

      const conversations = ctx.conversationRepo.queryConversations();
      assert.strictEqual(conversations[0].status, 'completed');
      assert.ok(conversations[0].response_frame_number);
    });

    test('marks conversation as error for 4xx/5xx status', () => {
      const reqResult = ctx.service.logRequestPacket({
        method: 'POST',
        url: '/mcp',
        headers: { 'mcp-session-id': 'sess-1' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'test', id: 'rpc-1' }),
      });

      ctx.service.logResponsePacket({
        statusCode: 500,
        headers: { 'mcp-session-id': 'sess-1' },
        body: JSON.stringify({ jsonrpc: '2.0', error: { message: 'Error' }, id: 'rpc-1' }),
        requestFrameNumber: reqResult.frameNumber,
        requestTimestampNs: reqResult.timestampNs,
      });

      const conversations = ctx.conversationRepo.queryConversations();
      assert.strictEqual(conversations[0].status, 'error');
    });
  });

  describe('traffic analyzer wiring', () => {
    test('passes remoteAddress as mcpServerName to analyzer for request and response', () => {
      const calls = [];
      const mockAnalyzer = {
        analyzeRequest: (p) => {
          calls.push(['req', p]);
          return [];
        },
        analyzeResponse: (p) => {
          calls.push(['res', p]);
          return [];
        },
      };
      ctx.service.setTrafficAnalyzer(mockAnalyzer);

      ctx.service.logRequestPacket({
        method: 'POST',
        url: '/mcp',
        headers: {},
        body: JSON.stringify({ jsonrpc: '2.0', method: 'ping', id: 1 }),
        remoteAddress: 'upstream-mcp-name',
      });

      ctx.service.logResponsePacket({
        statusCode: 200,
        headers: {},
        body: JSON.stringify({ jsonrpc: '2.0', result: {}, id: 1 }),
        remoteAddress: 'upstream-mcp-name',
      });

      assert.strictEqual(calls.length, 2);
      assert.strictEqual(calls[0][0], 'req');
      assert.strictEqual(calls[0][1].mcpServerName, 'upstream-mcp-name');
      assert.strictEqual(calls[1][0], 'res');
      assert.strictEqual(calls[1][1].mcpServerName, 'upstream-mcp-name');
    });
  });
});
