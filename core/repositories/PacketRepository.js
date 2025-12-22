import { Defaults } from '#core/constants/Defaults.js';

/**
 * Repository for packet-related database operations
 * Encapsulates all database queries for packets
 */
export class PacketRepository {
  constructor(db) {
    this.db = db;
  }

  queryPackets(filters = {}) {
    const {
      sessionId = null,
      direction = null,
      method = null,
      jsonrpcMethod = null,
      statusCode = null,
      startTime = null,
      endTime = null,
      jsonrpcId = null,
      limit = Defaults.DEFAULT_LIMIT,
      offset = Defaults.DEFAULT_OFFSET,
    } = filters;

    const queryParts = ['SELECT * FROM packets WHERE 1=1'];
    const params = [];

    if (sessionId) {
      queryParts.push('AND session_id = ?');
      params.push(sessionId);
    }

    if (direction) {
      queryParts.push('AND direction = ?');
      params.push(direction);
    }

    if (method) {
      queryParts.push('AND method = ?');
      params.push(method);
    }

    if (jsonrpcMethod) {
      queryParts.push('AND jsonrpc_method = ?');
      params.push(jsonrpcMethod);
    }

    if (statusCode !== null && statusCode !== undefined) {
      queryParts.push('AND status_code = ?');
      params.push(statusCode);
    }

    if (startTime) {
      queryParts.push('AND timestamp_ns >= ?');
      params.push(startTime);
    }

    if (endTime) {
      queryParts.push('AND timestamp_ns <= ?');
      params.push(endTime);
    }

    if (jsonrpcId) {
      queryParts.push('AND jsonrpc_id = ?');
      params.push(jsonrpcId);
    }

    queryParts.push('ORDER BY timestamp_ns ASC LIMIT ? OFFSET ?');
    params.push(limit, offset);

    const query = queryParts.join(' ');
    const stmt = this.db.prepare(query);
    return stmt.all(...params);
  }

  queryRequests(filters = {}) {
    const {
      sessionId = null,
      direction = null,
      method = null,
      jsonrpcMethod = null,
      statusCode = null,
      startTime = null,
      endTime = null,
      jsonrpcId = null,
      search = null,
      serverName = null,
      limit = Defaults.DEFAULT_LIMIT,
      offset = Defaults.DEFAULT_OFFSET,
    } = filters;

    const queryParts = ['SELECT * FROM packets WHERE 1=1'];
    const params = [];

    if (search) {
      const searchPattern = `%${search}%`;
      const serverNamePattern = `%"name":"${search}%`;
      queryParts.push(`AND (
        session_id LIKE ? ESCAPE '\\' OR
        method LIKE ? ESCAPE '\\' OR
        url LIKE ? ESCAPE '\\' OR
        jsonrpc_method LIKE ? ESCAPE '\\' OR
        jsonrpc_id LIKE ? ESCAPE '\\' OR
        info LIKE ? ESCAPE '\\' OR
        body_raw LIKE ? ESCAPE '\\' OR
        body_json LIKE ? ESCAPE '\\' OR
        headers_json LIKE ? ESCAPE '\\' OR
        host LIKE ? ESCAPE '\\' OR
        remote_address LIKE ? ESCAPE '\\' OR
        body_json LIKE ? ESCAPE '\\' OR
        body_raw LIKE ? ESCAPE '\\'
      )`);
      const searchParams = Array.from({ length: 11 }, () => searchPattern);
      params.push(...searchParams);
      params.push(serverNamePattern);
      params.push(serverNamePattern);
    }

    if (sessionId) {
      queryParts.push("AND session_id LIKE ? ESCAPE '\\'");
      params.push(`%${sessionId}%`);
    }
    if (direction) {
      queryParts.push('AND direction = ?');
      params.push(direction);
    }
    if (method) {
      queryParts.push("AND method LIKE ? ESCAPE '\\'");
      params.push(`%${method}%`);
    }
    if (jsonrpcMethod) {
      queryParts.push("AND jsonrpc_method LIKE ? ESCAPE '\\'");
      params.push(`%${jsonrpcMethod}%`);
    }
    if (statusCode !== null && statusCode !== undefined) {
      queryParts.push('AND status_code = ?');
      params.push(statusCode);
    }
    if (startTime) {
      queryParts.push('AND timestamp_ns >= ?');
      params.push(startTime);
    }
    if (endTime) {
      queryParts.push('AND timestamp_ns <= ?');
      params.push(endTime);
    }
    if (jsonrpcId) {
      queryParts.push("AND jsonrpc_id LIKE ? ESCAPE '\\'");
      params.push(`%${jsonrpcId}%`);
    }

    if (serverName) {
      const serverPattern = `%"name":"${serverName}.%`;
      const serverPattern2 = `%"name":"${serverName}"%`;
      queryParts.push(`AND (
        body_json LIKE ? ESCAPE '\\' OR
        body_raw LIKE ? ESCAPE '\\' OR
        body_json LIKE ? ESCAPE '\\' OR
        body_raw LIKE ? ESCAPE '\\'
      )`);
      params.push(serverPattern);
      params.push(serverPattern);
      params.push(serverPattern2);
      params.push(serverPattern2);
    }

    queryParts.push('ORDER BY timestamp_ns DESC LIMIT ? OFFSET ?');
    params.push(limit, offset);

    const query = queryParts.join(' ');
    const stmt = this.db.prepare(query);
    return stmt.all(...params);
  }

  getByFrameNumber(frameNumber) {
    const stmt = this.db.prepare('SELECT * FROM packets WHERE frame_number = ?');
    return stmt.get(frameNumber);
  }

  getSessionPackets(sessionId, limit = Defaults.DEFAULT_SESSION_LIMIT) {
    const stmt = this.db.prepare(`
      SELECT * FROM packets
      WHERE session_id = ?
      ORDER BY timestamp_ns ASC
      LIMIT ?
    `);
    return stmt.all(sessionId, limit);
  }

  getSessionRequests(sessionId, limit = Defaults.DEFAULT_SESSION_LIMIT) {
    const stmt = this.db.prepare(`
      SELECT * FROM packets
      WHERE session_id = ?
      ORDER BY timestamp_ns DESC
      LIMIT ?
    `);
    return stmt.all(sessionId, limit);
  }

  clearAll() {
    this.db.exec('PRAGMA foreign_keys = OFF');

    const tablesResult = this.db
      .prepare(
        `
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `
      )
      .all();

    const existingTables = tablesResult.map((row) => row.name);
    const trafficTables = ['conversations', 'packets', 'sessions'];

    const clearedTables = [];
    for (const table of trafficTables) {
      if (existingTables.includes(table)) {
        try {
          this.db.exec(`DELETE FROM ${table}`);
          clearedTables.push(table);
        } catch (_err) {
          // Log error but continue
        }
      }
    }

    this.db.exec('PRAGMA foreign_keys = ON');

    return { clearedTables };
  }

  getMaxTimestamp() {
    const stmt = this.db.prepare('SELECT MAX(timestamp_ns) as max_ts FROM packets');
    return stmt.get();
  }
}
