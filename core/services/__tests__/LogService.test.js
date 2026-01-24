import assert from 'node:assert';
import { beforeEach, describe, test } from 'node:test';
import { LogService } from '../LogService.js';

describe('LogService', () => {
  const ctx = {};

  beforeEach(() => {
    ctx.service = new LogService();
  });

  describe('initialize', () => {
    test('initializes with existing logs array', () => {
      const existingLogs = [{ type: 'info', line: 'test', timestamp: '2024-01-01' }];
      ctx.service.initialize(existingLogs);
      assert.strictEqual(ctx.service.getAllLogs().length, 1);
    });
  });

  describe('addLog', () => {
    test('adds log entry', () => {
      const logEntry = { type: 'info', line: 'Test log', timestamp: '2024-01-01T00:00:00Z' };
      ctx.service.addLog(logEntry);
      assert.strictEqual(ctx.service.getAllLogs().length, 1);
      assert.deepStrictEqual(ctx.service.getAllLogs()[0], logEntry);
    });

    test('returns the added log entry', () => {
      const logEntry = { type: 'error', line: 'Error log', timestamp: '2024-01-01T00:00:00Z' };
      const result = ctx.service.addLog(logEntry);
      assert.deepStrictEqual(result, logEntry);
    });
  });

  describe('getLogs', () => {
    test('returns logs in reverse order', () => {
      ctx.service.addLog({ type: 'info', line: 'Log 1', timestamp: '2024-01-01T00:00:01Z' });
      ctx.service.addLog({ type: 'info', line: 'Log 2', timestamp: '2024-01-01T00:00:02Z' });

      const logs = ctx.service.getLogs();
      assert.strictEqual(logs[0].line, 'Log 2');
      assert.strictEqual(logs[1].line, 'Log 1');
    });

    test('respects limit parameter', () => {
      ctx.service.addLog({ type: 'info', line: 'Log 1', timestamp: '2024-01-01' });
      ctx.service.addLog({ type: 'info', line: 'Log 2', timestamp: '2024-01-01' });
      ctx.service.addLog({ type: 'info', line: 'Log 3', timestamp: '2024-01-01' });

      const logs = ctx.service.getLogs({ limit: 2 });
      assert.strictEqual(logs.length, 2);
    });

    test('respects offset parameter', () => {
      ctx.service.addLog({ type: 'info', line: 'Log 1', timestamp: '2024-01-01' });
      ctx.service.addLog({ type: 'info', line: 'Log 2', timestamp: '2024-01-01' });
      ctx.service.addLog({ type: 'info', line: 'Log 3', timestamp: '2024-01-01' });

      const logs = ctx.service.getLogs({ limit: 10, offset: 1 });
      assert.strictEqual(logs.length, 2);
      assert.strictEqual(logs[0].line, 'Log 2');
    });
  });

  describe('clearLogs', () => {
    test('clears all logs', () => {
      ctx.service.addLog({ type: 'info', line: 'Test', timestamp: '2024-01-01' });
      ctx.service.addLog({ type: 'info', line: 'Test2', timestamp: '2024-01-01' });

      const result = ctx.service.clearLogs();
      assert.strictEqual(result.success, true);
      assert.strictEqual(ctx.service.getAllLogs().length, 0);
    });
  });

  describe('exportLogs', () => {
    test('exports logs in text format', () => {
      ctx.service.addLog({ type: 'info', line: 'Info message', timestamp: '2024-01-01T00:00:00Z' });
      ctx.service.addLog({
        type: 'error',
        line: 'Error message',
        timestamp: '2024-01-01T00:00:01Z',
      });

      const exported = ctx.service.exportLogs();
      assert.ok(exported.includes('[INFO]'));
      assert.ok(exported.includes('[ERROR]'));
      assert.ok(exported.includes('Info message'));
      assert.ok(exported.includes('Error message'));
    });

    test('returns empty string for no logs', () => {
      const exported = ctx.service.exportLogs();
      assert.strictEqual(exported, '');
    });
  });

  describe('getAllLogs', () => {
    test('returns all logs', () => {
      ctx.service.addLog({ type: 'info', line: 'Test', timestamp: '2024-01-01' });
      const logs = ctx.service.getAllLogs();
      assert.strictEqual(logs.length, 1);
    });
  });
});
