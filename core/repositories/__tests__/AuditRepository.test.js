import assert from 'node:assert';
import { test } from 'node:test';
import Database from 'better-sqlite3';
import { AuditRepository } from '../AuditRepository.js';
import { SchemaRepository } from '../SchemaRepository.js';

function createTestDb() {
  const db = new Database(':memory:');
  const schemaRepo = new SchemaRepository(db);
  schemaRepo.createSchema();
  return db;
}

test('logResponsePacket should preserve JSON string response body', () => {
  const db = createTestDb();
  const repo = new AuditRepository(db);

  // Test with the actual response body from the bug report
  const responseBody = JSON.stringify({
    result: {
      content: [{ type: 'text', text: 'Error: DDG detected an anomaly...' }],
      isError: true,
    },
    jsonrpc: '2.0',
    id: 7,
  });

  repo.logResponsePacket({
    statusCode: 200,
    headers: {},
    body: responseBody,
  });

  const stmt = db.prepare('SELECT body_json FROM packets WHERE direction = ?');
  const result = stmt.get('response');

  // Should preserve the original JSON string
  assert.strictEqual(result.body_json, responseBody);

  // Should NOT be a character code object
  const parsed = JSON.parse(result.body_json);
  assert.notStrictEqual(typeof parsed['0'], 'number');
  assert.strictEqual(parsed.jsonrpc, '2.0');
});

test('logResponsePacket should store JSON string correctly, not character code object', () => {
  const db = createTestDb();
  const repo = new AuditRepository(db);

  const responseBody = JSON.stringify({
    result: {
      content: [{ type: 'text', text: 'Error: DDG detected an anomaly...' }],
      isError: true,
    },
    jsonrpc: '2.0',
    id: 7,
  });

  repo.logResponsePacket({
    statusCode: 200,
    headers: {},
    body: responseBody,
  });

  const stmt = db.prepare('SELECT body_json FROM packets WHERE direction = ?');
  const result = stmt.get('response');

  // Should be the original JSON string, not a character code object
  assert.strictEqual(result.body_json, responseBody);

  // Should be parseable as valid JSON
  const parsed = JSON.parse(result.body_json);
  assert.strictEqual(parsed.jsonrpc, '2.0');
  assert.strictEqual(parsed.id, 7);
  assert.strictEqual(parsed.result.isError, true);

  // Should NOT be a character code object
  const parsedBody = JSON.parse(result.body_json);
  assert.notStrictEqual(typeof parsedBody['0'], 'number');
});
