import assert from 'node:assert';
import { afterEach, beforeEach, describe, test } from 'node:test';
import Database from 'better-sqlite3';
import { SchemaRepository } from '../SchemaRepository.js';

describe('SchemaRepository', () => {
  const ctx = {};

  beforeEach(() => {
    ctx.db = new Database(':memory:');
  });

  afterEach(() => {
    ctx.db.close();
  });

  describe('createSchema', () => {
    test('creates all required tables', () => {
      const schemaRepo = new SchemaRepository(ctx.db);
      schemaRepo.createSchema();

      const tables = ctx.db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        .all()
        .map((row) => row.name);

      assert.ok(tables.includes('packets'), 'packets table should exist');
      assert.ok(tables.includes('conversations'), 'conversations table should exist');
      assert.ok(tables.includes('sessions'), 'sessions table should exist');
    });

    test('creates required indexes', () => {
      const schemaRepo = new SchemaRepository(ctx.db);
      schemaRepo.createSchema();

      const indexes = ctx.db
        .prepare("SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%'")
        .all()
        .map((row) => row.name);

      assert.ok(indexes.includes('idx_packets_timestamp'), 'idx_packets_timestamp should exist');
      assert.ok(indexes.includes('idx_packets_session'), 'idx_packets_session should exist');
      assert.ok(indexes.includes('idx_packets_direction'), 'idx_packets_direction should exist');
      assert.ok(indexes.includes('idx_packets_jsonrpc_id'), 'idx_packets_jsonrpc_id should exist');
      assert.ok(
        indexes.includes('idx_conversations_session'),
        'idx_conversations_session should exist'
      );
    });

    test('is idempotent (can be called multiple times)', () => {
      const schemaRepo = new SchemaRepository(ctx.db);
      schemaRepo.createSchema();
      schemaRepo.createSchema();

      const tables = ctx.db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        .all();

      assert.ok(tables.length >= 3, 'Should have at least 3 tables');
    });

    test('packets table has correct schema', () => {
      const schemaRepo = new SchemaRepository(ctx.db);
      schemaRepo.createSchema();

      const columns = ctx.db.prepare("PRAGMA table_info('packets')").all();
      const columnNames = columns.map((col) => col.name);

      assert.ok(columnNames.includes('frame_number'), 'Should have frame_number column');
      assert.ok(columnNames.includes('timestamp_ns'), 'Should have timestamp_ns column');
      assert.ok(columnNames.includes('direction'), 'Should have direction column');
      assert.ok(columnNames.includes('session_id'), 'Should have session_id column');
      assert.ok(columnNames.includes('method'), 'Should have method column');
      assert.ok(columnNames.includes('url'), 'Should have url column');
      assert.ok(columnNames.includes('status_code'), 'Should have status_code column');
      assert.ok(columnNames.includes('headers_json'), 'Should have headers_json column');
      assert.ok(columnNames.includes('body_raw'), 'Should have body_raw column');
      assert.ok(columnNames.includes('body_json'), 'Should have body_json column');
      assert.ok(columnNames.includes('jsonrpc_id'), 'Should have jsonrpc_id column');
      assert.ok(columnNames.includes('jsonrpc_method'), 'Should have jsonrpc_method column');
    });

    test('conversations table has correct schema', () => {
      const schemaRepo = new SchemaRepository(ctx.db);
      schemaRepo.createSchema();

      const columns = ctx.db.prepare("PRAGMA table_info('conversations')").all();
      const columnNames = columns.map((col) => col.name);

      assert.ok(columnNames.includes('conversation_id'), 'Should have conversation_id column');
      assert.ok(
        columnNames.includes('request_frame_number'),
        'Should have request_frame_number column'
      );
      assert.ok(
        columnNames.includes('response_frame_number'),
        'Should have response_frame_number column'
      );
      assert.ok(columnNames.includes('session_id'), 'Should have session_id column');
      assert.ok(columnNames.includes('jsonrpc_id'), 'Should have jsonrpc_id column');
      assert.ok(columnNames.includes('duration_ms'), 'Should have duration_ms column');
      assert.ok(columnNames.includes('status'), 'Should have status column');
    });

    test('sessions table has correct schema', () => {
      const schemaRepo = new SchemaRepository(ctx.db);
      schemaRepo.createSchema();

      const columns = ctx.db.prepare("PRAGMA table_info('sessions')").all();
      const columnNames = columns.map((col) => col.name);

      assert.ok(columnNames.includes('session_id'), 'Should have session_id column');
      assert.ok(columnNames.includes('first_seen_ns'), 'Should have first_seen_ns column');
      assert.ok(columnNames.includes('last_seen_ns'), 'Should have last_seen_ns column');
      assert.ok(columnNames.includes('packet_count'), 'Should have packet_count column');
      assert.ok(columnNames.includes('user_agent'), 'Should have user_agent column');
      assert.ok(columnNames.includes('remote_address'), 'Should have remote_address column');
    });
  });
});
