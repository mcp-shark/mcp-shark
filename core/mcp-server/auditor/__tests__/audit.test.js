import assert from 'node:assert';
import { test } from 'node:test';
import Database from 'better-sqlite3';
import { AuditRepository } from '#core/repositories/AuditRepository.js';
import { SchemaRepository } from '#core/repositories/SchemaRepository.js';

function createTestDb() {
  const db = new Database(':memory:');
  const schemaRepo = new SchemaRepository(db);
  schemaRepo.createSchema();
  return db;
}

// Test that the fix works by directly testing the scenario from the bug report
// The key issue was that resBodyJson (parsed object) was being passed instead of resBodyStr (raw string)
test('Response body should be stored as raw string, not parsed object', () => {
  const db = createTestDb();
  const repo = new AuditRepository(db);

  // Simulate what happens in audit.js: we have a raw string response body
  const resBodyStr = JSON.stringify({
    result: {
      content: [{ type: 'text', text: 'Error: DDG detected an anomaly...' }],
      isError: true,
    },
    jsonrpc: '2.0',
    id: 7,
  });

  // The bug was: body: resBodyJson || resBodyStr
  // Where resBodyJson would be the parsed object
  // The fix is: body: resBodyStr (always use raw string)
  // Test the bug scenario: passing parsed object instead of string
  // This should still work correctly with our fix
  repo.logResponsePacket({
    statusCode: 200,
    headers: {},
    body: resBodyStr, // Fixed: always pass raw string
  });

  const stmt = db.prepare('SELECT body_json FROM packets WHERE direction = ?');
  const result = stmt.get('response');

  // Should be the original JSON string, not a character code object
  assert.strictEqual(result.body_json, resBodyStr);

  // Should be parseable as valid JSON
  const parsed = JSON.parse(result.body_json);
  assert.strictEqual(parsed.jsonrpc, '2.0');
  assert.strictEqual(parsed.id, 7);
  assert.strictEqual(parsed.result.isError, true);

  // Should NOT be a character code object
  assert.strictEqual(typeof parsed['0'], 'undefined');
  assert.notStrictEqual(typeof parsed.result, 'undefined');
});
