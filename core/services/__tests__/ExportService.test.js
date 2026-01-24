import assert from 'node:assert';
import { beforeEach, describe, test } from 'node:test';
import { ExportFormat } from '../../models/ExportFormat.js';
import { ExportService } from '../ExportService.js';

describe('ExportService', () => {
  const ctx = {};
  const mockSerializationLib = {
    serializeBigInt: (data) => JSON.parse(JSON.stringify(data)),
  };

  beforeEach(() => {
    ctx.service = new ExportService();
  });

  const sampleRequests = [
    {
      frame_number: 1,
      timestamp_iso: '2024-01-01T00:00:00Z',
      direction: 'request',
      session_id: 'sess-1',
      server_name: 'test-server',
      length: 100,
      jsonrpc_method: 'tools/call',
      request: { method: 'POST', host: 'localhost' },
      response: { status_code: 200 },
    },
    {
      frame_number: 2,
      timestamp_iso: '2024-01-01T00:00:01Z',
      direction: 'response',
      session_id: 'sess-1',
      server_name: 'test-server',
      length: 200,
      jsonrpc_method: 'tools/call',
      jsonrpc_id: 'rpc-1',
      request: { method: 'POST', host: 'localhost' },
      response: { status_code: 200 },
    },
  ];

  describe('formatAsCsv', () => {
    test('returns CSV content with headers', () => {
      const result = ctx.service.formatAsCsv(sampleRequests);

      assert.strictEqual(result.contentType, 'text/csv');
      assert.strictEqual(result.extension, 'csv');
      assert.ok(result.content.includes('Frame'));
      assert.ok(result.content.includes('Time'));
      assert.ok(result.content.includes('Method'));
    });

    test('escapes quotes in CSV cells', () => {
      const requestsWithQuotes = [
        {
          frame_number: 1,
          session_id: 'session "with" quotes',
          request: { method: 'GET' },
        },
      ];
      const result = ctx.service.formatAsCsv(requestsWithQuotes);
      assert.ok(result.content.includes('""'));
    });

    test('handles empty requests array', () => {
      const result = ctx.service.formatAsCsv([]);
      assert.ok(result.content.includes('Frame'));
      const lines = result.content.split('\n');
      assert.strictEqual(lines.length, 1);
    });
  });

  describe('formatAsTxt', () => {
    test('returns TXT content with request details', () => {
      const result = ctx.service.formatAsTxt(sampleRequests);

      assert.strictEqual(result.contentType, 'text/plain');
      assert.strictEqual(result.extension, 'txt');
      assert.ok(result.content.includes('Request/Response #1'));
      assert.ok(result.content.includes('Frame 1'));
      assert.ok(result.content.includes('Session ID: sess-1'));
    });

    test('handles missing fields gracefully', () => {
      const incompleteRequests = [{ frame_number: 1 }];
      const result = ctx.service.formatAsTxt(incompleteRequests);

      assert.ok(result.content.includes('N/A'));
    });
  });

  describe('formatAsJson', () => {
    test('returns JSON content', () => {
      const result = ctx.service.formatAsJson(sampleRequests, mockSerializationLib);

      assert.strictEqual(result.contentType, 'application/json');
      assert.strictEqual(result.extension, 'json');

      const parsed = JSON.parse(result.content);
      assert.strictEqual(parsed.length, 2);
      assert.strictEqual(parsed[0].frame_number, 1);
    });

    test('uses serialization library for BigInt handling', () => {
      const state = { serializeCalled: false };
      const mockLib = {
        serializeBigInt: (data) => {
          state.serializeCalled = true;
          return data;
        },
      };

      ctx.service.formatAsJson(sampleRequests, mockLib);
      assert.strictEqual(state.serializeCalled, true);
    });
  });

  describe('exportRequests', () => {
    test('exports as CSV when format is csv', () => {
      const result = ctx.service.exportRequests(
        sampleRequests,
        ExportFormat.CSV,
        mockSerializationLib
      );
      assert.strictEqual(result.extension, 'csv');
    });

    test('exports as TXT when format is txt', () => {
      const result = ctx.service.exportRequests(
        sampleRequests,
        ExportFormat.TXT,
        mockSerializationLib
      );
      assert.strictEqual(result.extension, 'txt');
    });

    test('exports as JSON when format is json', () => {
      const result = ctx.service.exportRequests(
        sampleRequests,
        ExportFormat.JSON,
        mockSerializationLib
      );
      assert.strictEqual(result.extension, 'json');
    });

    test('defaults to JSON for unknown format', () => {
      const result = ctx.service.exportRequests(sampleRequests, 'unknown', mockSerializationLib);
      assert.strictEqual(result.extension, 'json');
    });
  });
});
