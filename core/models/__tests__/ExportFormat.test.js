import assert from 'node:assert';
import { describe, test } from 'node:test';
import { ExportFormat } from '../ExportFormat.js';

describe('ExportFormat', () => {
  test('defines JSON format', () => {
    assert.strictEqual(ExportFormat.JSON, 'json');
  });

  test('defines CSV format', () => {
    assert.strictEqual(ExportFormat.CSV, 'csv');
  });

  test('defines TXT format', () => {
    assert.strictEqual(ExportFormat.TXT, 'txt');
  });
});
