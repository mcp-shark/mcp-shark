import Database from 'better-sqlite3';
import { ensureDirectoryExists } from '#core/configs/index.js';
import { SchemaRepository } from '#core/repositories/SchemaRepository.js';

function configureDatabase(db) {
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

function initializeSchema(db) {
  const schemaRepository = new SchemaRepository(db);
  schemaRepository.createSchema();
  return db;
}

export function initDb(dbConnectionString) {
  const db = new Database(dbConnectionString);
  configureDatabase(db);
  return initializeSchema(db);
}

/**
 * Open or create a database file, ensuring the directory exists
 * Creates tables if the database is new or ensures they exist
 */
export function openDb(dbPath) {
  ensureDirectoryExists(dbPath);

  const db = new Database(dbPath);
  configureDatabase(db);
  return initializeSchema(db);
}
