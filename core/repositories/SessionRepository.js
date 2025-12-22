import { Defaults } from '#core/constants/Defaults';

/**
 * Repository for session-related database operations
 */
export class SessionRepository {
  constructor(db) {
    this.db = db;
  }

  /**
   * Get session metadata
   */
  getSessions(filters = {}) {
    const {
      startTime = null,
      endTime = null,
      limit = Defaults.DEFAULT_LIMIT,
      offset = Defaults.DEFAULT_OFFSET,
    } = filters;

    const queryParts = ['SELECT * FROM sessions WHERE 1=1'];
    const params = [];

    if (startTime) {
      queryParts.push('AND first_seen_ns >= ?');
      params.push(startTime);
    }

    if (endTime) {
      queryParts.push('AND last_seen_ns <= ?');
      params.push(endTime);
    }

    queryParts.push('ORDER BY first_seen_ns DESC LIMIT ? OFFSET ?');
    params.push(limit, offset);

    const query = queryParts.join(' ');
    const stmt = this.db.prepare(query);
    return stmt.all(...params);
  }

  /**
   * Update or create session record
   */
  upsertSession(sessionId, timestampNs, userAgent, remoteAddress, host) {
    const stmt = this.db.prepare(`
      INSERT INTO sessions (session_id, first_seen_ns, last_seen_ns, packet_count, user_agent, remote_address, host)
      VALUES (?, ?, ?, 1, ?, ?, ?)
      ON CONFLICT(session_id) DO UPDATE SET
        last_seen_ns = excluded.last_seen_ns,
        packet_count = packet_count + 1,
        user_agent = COALESCE(excluded.user_agent, user_agent),
        remote_address = COALESCE(excluded.remote_address, remote_address),
        host = COALESCE(excluded.host, host)
    `);
    stmt.run(sessionId, timestampNs, timestampNs, userAgent, remoteAddress, host);
  }
}
