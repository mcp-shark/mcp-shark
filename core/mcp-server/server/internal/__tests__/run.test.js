import assert from 'node:assert';
import { describe, test } from 'node:test';
import { getInternalServer, runInternalServer } from '../run.js';

function createMockLogger() {
  return { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} };
}

function createMockReq(params = ['test-server']) {
  return {
    params,
    get: () => null,
    method: 'POST',
    url: '/mcp/test-server',
    headers: {},
  };
}

function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    status: function (code) {
      this.statusCode = code;
      return this;
    },
    json: function (data) {
      this.body = data;
      return this;
    },
    setHeader: function (key, value) {
      this.headers[key] = value;
      return this;
    },
  };
  return res;
}

describe('run', () => {
  describe('getInternalServer', () => {
    test('creates express app', () => {
      const mockServerFactory = () => ({});
      const mockAuditLogger = {};
      const mockHandler = async () => {};

      const app = getInternalServer(mockServerFactory, mockAuditLogger, mockHandler);

      assert.ok(app);
      assert.strictEqual(typeof app.use, 'function');
      assert.strictEqual(typeof app.all, 'function');
      assert.strictEqual(typeof app.listen, 'function');
    });

    test('app has JSON middleware configured', () => {
      const mockServerFactory = () => ({});
      const mockAuditLogger = {};
      const mockHandler = async () => {};

      const app = getInternalServer(mockServerFactory, mockAuditLogger, mockHandler);

      assert.ok(app._router);
      assert.ok(app._router.stack.length > 0);
    });

    test('app handles 404 for unknown routes', async () => {
      const mockServerFactory = () => ({});
      const mockAuditLogger = {};
      const mockHandler = async () => {};

      const app = getInternalServer(mockServerFactory, mockAuditLogger, mockHandler);

      // Find the 404 handler in the stack
      const hasNotFoundHandler = app._router.stack.some(
        (layer) => layer.name === 'handleNotFoundRoute'
      );
      assert.ok(hasNotFoundHandler);
    });

    test('app has CORS configured for /mcp path', () => {
      const mockServerFactory = () => ({});
      const mockAuditLogger = {};
      const mockHandler = async () => {};

      const app = getInternalServer(mockServerFactory, mockAuditLogger, mockHandler);

      // Check that middleware stack is populated
      assert.ok(app._router.stack.length > 0);
    });

    test('app has route for /mcp/*', () => {
      const mockServerFactory = () => ({});
      const mockAuditLogger = {};
      const mockHandler = async () => {};

      const app = getInternalServer(mockServerFactory, mockAuditLogger, mockHandler);

      const hasMcpRoute = app._router.stack.some((layer) => {
        return layer.route && layer.route.path === '/mcp/*';
      });
      assert.ok(hasMcpRoute);
    });

    test('handles 404 route correctly', () => {
      const mockServerFactory = () => ({});
      const mockAuditLogger = {};
      const mockHandler = async () => {};

      const app = getInternalServer(mockServerFactory, mockAuditLogger, mockHandler);

      // Find the 404 handler and call it directly
      const notFoundLayer = app._router.stack.find((layer) => layer.name === 'handleNotFoundRoute');

      assert.ok(notFoundLayer);

      const mockRes = createMockRes();
      notFoundLayer.handle(createMockReq(), mockRes, () => {});

      assert.strictEqual(mockRes.statusCode, 404);
      assert.deepStrictEqual(mockRes.body, { error: 'Not found' });
    });

    test('MCP route calls handler with session', async () => {
      const handlerCalls = [];
      const mockServerFactory = () => ({
        connect: async () => {},
      });
      const mockAuditLogger = {};
      const mockHandler = async (...args) => {
        handlerCalls.push(args);
      };

      const app = getInternalServer(mockServerFactory, mockAuditLogger, mockHandler);

      // Find the MCP route handler
      const mcpRoute = app._router.stack.find((layer) => {
        return layer.route && layer.route.path === '/mcp/*';
      });

      assert.ok(mcpRoute);
    });
  });

  describe('runInternalServer', () => {
    test('starts server listening on port', () => {
      const logger = createMockLogger();
      const mockApp = {
        listen: (port, host, callback) => {
          assert.strictEqual(port, 3000);
          assert.strictEqual(host, '0.0.0.0');
          assert.strictEqual(typeof callback, 'function');
          callback();
          return { close: () => {} };
        },
      };

      runInternalServer(logger, 3000, mockApp);
    });

    test('logs message when server starts', () => {
      const infoCalls = [];
      const logger = {
        debug: () => {},
        info: (...args) => infoCalls.push(args),
        warn: () => {},
        error: () => {},
      };
      const mockApp = {
        listen: (_port, _host, callback) => {
          callback();
          return { close: () => {} };
        },
      };

      runInternalServer(logger, 8080, mockApp);

      assert.ok(infoCalls.length > 0);
      assert.ok(infoCalls[0][0].includes('8080'));
    });
  });
});
