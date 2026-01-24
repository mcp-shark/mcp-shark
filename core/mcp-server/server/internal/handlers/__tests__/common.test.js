import assert from 'node:assert';
import { describe, test } from 'node:test';
import { SERVER_NAME, TRANSPORT_TYPE, getSessionFromRequest } from '../common.js';

describe('common', () => {
  describe('constants', () => {
    test('SERVER_NAME is defined', () => {
      assert.strictEqual(SERVER_NAME, 'mcp-internal-server');
    });

    test('TRANSPORT_TYPE is defined', () => {
      assert.strictEqual(TRANSPORT_TYPE, 'http');
    });
  });

  describe('getSessionFromRequest', () => {
    test('returns null for null request', () => {
      const result = getSessionFromRequest(null);
      assert.strictEqual(result, null);
    });

    test('returns null for undefined request', () => {
      const result = getSessionFromRequest(undefined);
      assert.strictEqual(result, null);
    });

    test('returns sessionId from request.sessionId', () => {
      const req = { sessionId: 'session-123' };
      const result = getSessionFromRequest(req);
      assert.strictEqual(result, 'session-123');
    });

    test('returns sessionId from Mcp-Session-Id header', () => {
      const req = {
        get: (header) => {
          if (header === 'Mcp-Session-Id') {
            return 'session-from-header';
          }
          return null;
        },
      };
      const result = getSessionFromRequest(req);
      assert.strictEqual(result, 'session-from-header');
    });

    test('returns sessionId from X-MCP-Session-Id header', () => {
      const req = {
        get: (header) => {
          if (header === 'X-MCP-Session-Id') {
            return 'session-x-header';
          }
          return null;
        },
      };
      const result = getSessionFromRequest(req);
      assert.strictEqual(result, 'session-x-header');
    });

    test('prefers Mcp-Session-Id over X-MCP-Session-Id', () => {
      const req = {
        get: (header) => {
          if (header === 'Mcp-Session-Id') {
            return 'mcp-session';
          }
          if (header === 'X-MCP-Session-Id') {
            return 'x-mcp-session';
          }
          return null;
        },
      };
      const result = getSessionFromRequest(req);
      assert.strictEqual(result, 'mcp-session');
    });

    test('returns null when no session found', () => {
      const req = {
        get: () => null,
      };
      const result = getSessionFromRequest(req);
      assert.strictEqual(result, null);
    });

    test('returns null when get is not a function', () => {
      const req = { get: 'not-a-function' };
      const result = getSessionFromRequest(req);
      assert.strictEqual(result, null);
    });

    test('prefers sessionId property over headers', () => {
      const req = {
        sessionId: 'direct-session',
        get: () => 'header-session',
      };
      const result = getSessionFromRequest(req);
      assert.strictEqual(result, 'direct-session');
    });
  });
});
