import assert from 'node:assert';
import { describe, test } from 'node:test';
import { withSession } from '../session.js';

describe('session', () => {
  describe('withSession', () => {
    test('module exports withSession function', async () => {
      assert.strictEqual(typeof withSession, 'function');
    });

    test('calls requestHandler for existing session', async () => {
      const handlerCalls = [];
      const mockServerFactory = () => ({
        connect: async () => {},
      });
      const mockRequestHandler = async (...args) => {
        handlerCalls.push(args);
      };
      const mockReq = {
        params: ['test-server'],
        sessionId: 'existing-session-id',
        get: () => 'existing-session-id',
      };
      const mockRes = {};
      const mockAuditLogger = {};

      await withSession(mockServerFactory, mockRequestHandler, mockReq, mockRes, mockAuditLogger);

      assert.ok(handlerCalls.length > 0);
    });

    test('creates new session when no session ID provided', async () => {
      const handlerCalls = [];
      const mockServerFactory = () => ({
        connect: async () => {},
      });
      const mockRequestHandler = async (...args) => {
        handlerCalls.push(args);
      };
      const mockReq = {
        params: ['test-server'],
        get: () => null,
      };
      const mockRes = {};
      const mockAuditLogger = {};

      await withSession(mockServerFactory, mockRequestHandler, mockReq, mockRes, mockAuditLogger);

      assert.ok(handlerCalls.length > 0);
      // Check that initialSessionId was passed (6th argument)
      const lastCall = handlerCalls[handlerCalls.length - 1];
      assert.ok(lastCall[5] !== undefined);
    });

    test('uses session from Mcp-Session-Id header', async () => {
      const handlerCalls = [];
      const mockServerFactory = () => ({
        connect: async () => {},
      });
      const mockRequestHandler = async (...args) => {
        handlerCalls.push(args);
      };
      const mockReq = {
        params: ['test-server'],
        get: (header) => {
          if (header === 'Mcp-Session-Id') {
            return 'header-session-id';
          }
          return null;
        },
      };
      const mockRes = {};
      const mockAuditLogger = {};

      await withSession(mockServerFactory, mockRequestHandler, mockReq, mockRes, mockAuditLogger);

      assert.ok(handlerCalls.length > 0);
    });

    test('passes requestedMcpServer to handler', async () => {
      const handlerCalls = [];
      const mockServerFactory = () => ({
        connect: async () => {},
      });
      const mockRequestHandler = async (...args) => {
        handlerCalls.push(args);
      };
      const mockReq = {
        params: ['my-mcp-server'],
        get: () => null,
      };
      const mockRes = {};
      const mockAuditLogger = {};

      await withSession(mockServerFactory, mockRequestHandler, mockReq, mockRes, mockAuditLogger);

      const lastCall = handlerCalls[handlerCalls.length - 1];
      assert.strictEqual(lastCall[4], 'my-mcp-server');
    });

    test('calls serverFactory with requested server name', async () => {
      const factoryCalls = [];
      const mockServerFactory = (serverName) => {
        factoryCalls.push(serverName);
        return {
          connect: async () => {},
        };
      };
      const mockRequestHandler = async () => {};
      const mockReq = {
        params: ['requested-server'],
        get: () => null,
      };
      const mockRes = {};
      const mockAuditLogger = {};

      await withSession(mockServerFactory, mockRequestHandler, mockReq, mockRes, mockAuditLogger);

      assert.ok(factoryCalls.includes('requested-server'));
    });
  });
});
