import { StatusCodeRanges } from '#core/constants/StatusCodes';

/**
 * Repository for statistics-related database operations
 */
export class StatisticsRepository {
  constructor(db) {
    this.db = db;
  }

  /**
   * Get statistics for forensic analysis
   */
  getStatistics(filters = {}) {
    const { sessionId = null, startTime = null, endTime = null } = filters;

    const whereParts = ['WHERE 1=1'];
    const params = [];

    if (sessionId) {
      whereParts.push('AND session_id = ?');
      params.push(sessionId);
    }

    if (startTime) {
      whereParts.push('AND timestamp_ns >= ?');
      params.push(startTime);
    }

    if (endTime) {
      whereParts.push('AND timestamp_ns <= ?');
      params.push(endTime);
    }

    const whereClause = whereParts.join(' ');
    const statsQuery = `
      SELECT 
        COUNT(*) as total_packets,
        COUNT(CASE WHEN direction = 'request' THEN 1 END) as total_requests,
        COUNT(CASE WHEN direction = 'response' THEN 1 END) as total_responses,
        COUNT(CASE WHEN status_code >= ${StatusCodeRanges.CLIENT_ERROR_START} THEN 1 END) as total_errors,
        COUNT(DISTINCT session_id) as unique_sessions,
        AVG(length) as avg_packet_size,
        SUM(length) as total_bytes,
        MIN(timestamp_ns) as first_packet_ns,
        MAX(timestamp_ns) as last_packet_ns
      FROM packets
      ${whereClause}
    `;

    const stmt = this.db.prepare(statsQuery);
    return stmt.get(...params);
  }
}
