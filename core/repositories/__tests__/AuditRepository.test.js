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

// Test case exactly reproducing Issue #4:
// https://github.com/mcp-shark/mcp-shark/issues/4
test('Issue #4: character code object should be converted back to JSON string', () => {
  const db = createTestDb();
  const repo = new AuditRepository(db);

  // The exact expected response from the issue
  const expectedJson =
    '{"result":{"content":[{"type":"text","text":"Error: DDG detected an anomaly..."}],"isError":true},"jsonrpc":"2.0","id":7}';

  // Simulate the bug: create a character code object
  // This is what the bug produced: {"0":123,"1":34,"2":114,...} where values are ASCII codes
  const characterCodeObject = {};
  [...expectedJson].forEach((char, i) => {
    characterCodeObject[String(i)] = char.charCodeAt(0);
  });

  // Verify this matches the exact format from the issue
  assert.strictEqual(characterCodeObject['0'], 123); // '{'
  assert.strictEqual(characterCodeObject['1'], 34); // '"'
  assert.strictEqual(characterCodeObject['2'], 114); // 'r'
  assert.strictEqual(characterCodeObject['3'], 101); // 'e'
  assert.strictEqual(characterCodeObject['4'], 115); // 's'
  assert.strictEqual(characterCodeObject['5'], 117); // 'u'
  assert.strictEqual(characterCodeObject['6'], 108); // 'l'
  assert.strictEqual(characterCodeObject['7'], 116); // 't'

  // Pass the character code object to the repository
  // The fix should detect and convert it back to the original string
  repo.logResponsePacket({
    statusCode: 200,
    headers: {},
    body: characterCodeObject,
  });

  const stmt = db.prepare('SELECT body_json FROM packets WHERE direction = ?');
  const result = stmt.get('response');

  // Should be the correct JSON string, not the character code object
  assert.strictEqual(result.body_json, expectedJson);

  // Verify it's valid JSON with correct structure
  const parsed = JSON.parse(result.body_json);
  assert.strictEqual(parsed.jsonrpc, '2.0');
  assert.strictEqual(parsed.id, 7);
  assert.strictEqual(parsed.result.isError, true);
  assert.strictEqual(parsed.result.content[0].type, 'text');
  assert.strictEqual(parsed.result.content[0].text, 'Error: DDG detected an anomaly...');
});
