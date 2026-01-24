import assert from 'node:assert';
import { describe, test } from 'node:test';
import { TransportError, makeTransport } from '../transport.js';

describe('transport', () => {
  describe('TransportError', () => {
    test('creates error with message', () => {
      const error = new TransportError('Test error');
      assert.strictEqual(error.name, 'TransportError');
    });

    test('creates error with cause', () => {
      const cause = new Error('Root cause');
      const error = new TransportError('Test error', cause);
      assert.strictEqual(error.name, 'TransportError');
    });
  });

  describe('makeTransport', () => {
    test('creates StdioClientTransport for stdio type', () => {
      const transport = makeTransport({
        type: 'stdio',
        command: 'node',
        args: ['server.js'],
      });

      assert.ok(transport);
      assert.ok(!(transport instanceof TransportError));
    });

    test('creates StreamableHTTPClientTransport for http type', () => {
      const transport = makeTransport({
        type: 'http',
        url: 'http://localhost:3000',
      });

      assert.ok(transport);
      assert.ok(!(transport instanceof TransportError));
    });

    test('creates StreamableHTTPClientTransport for sse type', () => {
      const transport = makeTransport({
        type: 'sse',
        url: 'http://localhost:3000/sse',
      });

      assert.ok(transport);
      assert.ok(!(transport instanceof TransportError));
    });

    test('creates StreamableHTTPClientTransport for streamable-http type', () => {
      const transport = makeTransport({
        type: 'streamable-http',
        url: 'http://localhost:3000',
      });

      assert.ok(transport);
      assert.ok(!(transport instanceof TransportError));
    });

    test('creates WebSocketClientTransport for ws type', () => {
      const transport = makeTransport({
        type: 'ws',
        url: 'ws://localhost:3000',
      });

      assert.ok(transport);
      assert.ok(!(transport instanceof TransportError));
    });

    test('creates WebSocketClientTransport for websocket type', () => {
      const transport = makeTransport({
        type: 'websocket',
        url: 'ws://localhost:3000',
      });

      assert.ok(transport);
      assert.ok(!(transport instanceof TransportError));
    });

    test('falls back to stdio when command provided with unknown type', () => {
      const transport = makeTransport({
        type: 'unknown',
        command: 'node',
        args: ['server.js'],
      });

      assert.ok(transport);
      assert.ok(!(transport instanceof TransportError));
    });

    test('returns TransportError for unsupported config without command', () => {
      const transport = makeTransport({
        type: 'unsupported',
      });

      assert.ok(transport instanceof TransportError);
    });

    test('passes custom headers for http transport', () => {
      const transport = makeTransport({
        type: 'http',
        url: 'http://localhost:3000',
        headers: { Authorization: 'Bearer token' },
      });

      assert.ok(transport);
      assert.ok(!(transport instanceof TransportError));
    });

    test('passes custom env for stdio transport', () => {
      const transport = makeTransport({
        type: 'stdio',
        command: 'node',
        args: ['server.js'],
        env: { CUSTOM_VAR: 'value' },
      });

      assert.ok(transport);
      assert.ok(!(transport instanceof TransportError));
    });
  });
});
