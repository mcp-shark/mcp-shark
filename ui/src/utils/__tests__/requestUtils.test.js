import { describe, expect, it } from 'vitest';
import {
  extractServerName,
  formatDateTime,
  formatRelativeTime,
  getEndpoint,
  getInfo,
  getJsonRpcMethod,
  getRequestColor,
  getSourceDest,
} from '../requestUtils';

describe('requestUtils', () => {
  describe('extractServerName', () => {
    it('extracts server name from body_json params.name', () => {
      const request = {
        body_json: '{"params": {"name": "myserver.tool"}}',
      };

      expect(extractServerName(request)).toBe('myserver');
    });

    it('returns full name if no dot', () => {
      const request = {
        body_json: '{"params": {"name": "myserver"}}',
      };

      expect(extractServerName(request)).toBe('myserver');
    });

    it('falls back to body_raw', () => {
      const request = {
        body_raw: '{"params": {"name": "rawserver.tool"}}',
      };

      expect(extractServerName(request)).toBe('rawserver');
    });

    it('falls back to host', () => {
      const request = { host: 'localhost:3000' };

      expect(extractServerName(request)).toBe('localhost:3000');
    });

    it('returns unknown server placeholder', () => {
      const request = {};

      expect(extractServerName(request)).toBe('__UNKNOWN_SERVER__');
    });
  });

  describe('formatRelativeTime', () => {
    it('returns 0.000000 when no first time', () => {
      expect(formatRelativeTime('2024-01-01T00:00:00Z', null)).toBe('0.000000');
    });

    it('calculates relative time in seconds', () => {
      const first = '2024-01-01T00:00:00.000Z';
      const current = '2024-01-01T00:00:01.500Z';

      expect(formatRelativeTime(current, first)).toBe('1.500000');
    });
  });

  describe('formatDateTime', () => {
    it('returns dash for null input', () => {
      expect(formatDateTime(null)).toBe('-');
    });

    it('formats valid date', () => {
      const result = formatDateTime('2024-01-15T10:30:00Z');
      expect(result).toBeTruthy();
      expect(result).not.toBe('-');
    });
  });

  describe('getSourceDest', () => {
    it('returns LLM Server as source for requests', () => {
      const request = { direction: 'request', remote_address: '192.168.1.1' };
      const result = getSourceDest(request);

      expect(result.source).toBe('LLM Server');
      expect(result.dest).toBe('192.168.1.1');
    });

    it('returns LLM Server as dest for responses', () => {
      const request = { direction: 'response', remote_address: '192.168.1.1' };
      const result = getSourceDest(request);

      expect(result.source).toBe('192.168.1.1');
      expect(result.dest).toBe('LLM Server');
    });
  });

  describe('getEndpoint', () => {
    it('extracts method from body_json for requests', () => {
      const request = {
        direction: 'request',
        body_json: '{"method": "tools/call"}',
      };

      expect(getEndpoint(request)).toBe('tools/call');
    });

    it('returns jsonrpc_method if present', () => {
      const request = {
        direction: 'request',
        jsonrpc_method: 'tools/list',
      };

      expect(getEndpoint(request)).toBe('tools/list');
    });

    it('returns dash for responses', () => {
      const request = { direction: 'response' };

      expect(getEndpoint(request)).toBe('-');
    });
  });

  describe('getInfo', () => {
    it('returns method + endpoint for requests', () => {
      const request = {
        direction: 'request',
        method: 'POST',
        body_json: '{"method": "tools/call"}',
        url: '/mcp',
      };

      expect(getInfo(request)).toContain('tools/call');
    });

    it('returns status + method for responses', () => {
      const request = {
        direction: 'response',
        status_code: 200,
        jsonrpc_method: 'tools/call',
      };

      expect(getInfo(request)).toContain('200');
    });
  });

  describe('getRequestColor', () => {
    it('returns request color for requests', () => {
      const request = { direction: 'request' };
      expect(getRequestColor(request)).toBe('#faf9f7');
    });

    it('returns error color for 4xx/5xx responses', () => {
      const request = { direction: 'response', status_code: 500 };
      expect(getRequestColor(request)).toBe('#fef0f0');
    });

    it('returns warning color for 3xx responses', () => {
      const request = { direction: 'response', status_code: 301 };
      expect(getRequestColor(request)).toBe('#fff8e8');
    });

    it('returns success color for 2xx responses', () => {
      const request = { direction: 'response', status_code: 200 };
      expect(getRequestColor(request)).toBe('#f0f8f0');
    });
  });

  describe('getJsonRpcMethod', () => {
    it('returns jsonrpc_method if present', () => {
      const request = { jsonrpc_method: 'tools/call' };
      expect(getJsonRpcMethod(request)).toBe('tools/call');
    });

    it('extracts from body_json for requests', () => {
      const request = {
        direction: 'request',
        body_json: '{"method": "resources/list"}',
      };
      expect(getJsonRpcMethod(request)).toBe('resources/list');
    });

    it('returns null when not found', () => {
      const request = { direction: 'response' };
      expect(getJsonRpcMethod(request)).toBeNull();
    });
  });
});
