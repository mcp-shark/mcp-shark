/**
 * Repository for conversation-related database operations
 */
export class ConversationRepository {
  constructor(db) {
    this.db = db;
  }

  /**
   * Get conversation flow (request/response pairs)
   */
  queryConversations(filters = {}) {
    const {
      sessionId = null,
      method = null,
      status = null,
      startTime = null,
      endTime = null,
      jsonrpcId = null,
      limit = 1000,
      offset = 0,
    } = filters;

    const queryParts = [
      'SELECT',
      '  c.*,',
      '  req.frame_number as req_frame,',
      '  req.timestamp_iso as req_timestamp_iso,',
      '  req.method as req_method,',
      '  req.url as req_url,',
      '  req.jsonrpc_method as req_jsonrpc_method,',
      '  req.body_json as req_body_json,',
      '  req.headers_json as req_headers_json,',
      '  resp.frame_number as resp_frame,',
      '  resp.timestamp_iso as resp_timestamp_iso,',
      '  resp.status_code as resp_status_code,',
      '  resp.jsonrpc_method as resp_jsonrpc_method,',
      '  resp.body_json as resp_body_json,',
      '  resp.headers_json as resp_headers_json,',
      '  resp.jsonrpc_result as resp_jsonrpc_result,',
      '  resp.jsonrpc_error as resp_jsonrpc_error',
      'FROM conversations c',
      'LEFT JOIN packets req ON c.request_frame_number = req.frame_number',
      'LEFT JOIN packets resp ON c.response_frame_number = resp.frame_number',
      'WHERE 1=1',
    ];

    const params = [];

    if (sessionId) {
      queryParts.push('AND c.session_id = ?');
      params.push(sessionId);
    }

    if (method) {
      queryParts.push('AND c.method = ?');
      params.push(method);
    }

    if (status) {
      queryParts.push('AND c.status = ?');
      params.push(status);
    }

    if (startTime) {
      queryParts.push('AND c.request_timestamp_ns >= ?');
      params.push(startTime);
    }

    if (endTime) {
      queryParts.push('AND c.request_timestamp_ns <= ?');
      params.push(endTime);
    }

    if (jsonrpcId) {
      queryParts.push('AND c.jsonrpc_id = ?');
      params.push(jsonrpcId);
    }

    queryParts.push('ORDER BY c.request_timestamp_ns ASC LIMIT ? OFFSET ?');
    params.push(limit, offset);

    const query = queryParts.join(' ');
    const stmt = this.db.prepare(query);
    return stmt.all(...params);
  }

  /**
   * Create conversation entry for request
   */
  createConversation(frameNumber, sessionId, jsonrpcId, method, timestampNs) {
    const stmt = this.db.prepare(`
      INSERT INTO conversations (
        request_frame_number,
        session_id,
        jsonrpc_id,
        method,
        request_timestamp_ns,
        status
      ) VALUES (?, ?, ?, ?, ?, 'pending')
    `);
    stmt.run(frameNumber, sessionId, jsonrpcId, method, timestampNs);
  }

  /**
   * Update conversation entry with response
   */
  updateConversationWithResponse(
    requestFrameNumber,
    responseFrameNumber,
    timestampNs,
    durationMs,
    status
  ) {
    const stmt = this.db.prepare(`
      UPDATE conversations
      SET response_frame_number = ?,
          response_timestamp_ns = ?,
          duration_ms = ?,
          status = ?
      WHERE request_frame_number = ?
    `);
    stmt.run(responseFrameNumber, timestampNs, durationMs, status, requestFrameNumber);
  }

  /**
   * Find conversation by JSON-RPC ID
   */
  findConversationByJsonRpcId(jsonrpcId) {
    const stmt = this.db.prepare(`
      SELECT request_frame_number FROM conversations
      WHERE jsonrpc_id = ? AND response_frame_number IS NULL
      ORDER BY request_timestamp_ns DESC
      LIMIT 1
    `);
    return stmt.get(jsonrpcId);
  }

  /**
   * Get conversation statistics
   */
  getConversationStatistics(filters = {}) {
    const { sessionId = null, startTime = null, endTime = null } = filters;

    const whereParts = ['WHERE 1=1'];
    const params = [];

    if (sessionId) {
      whereParts.push('AND session_id = ?');
      params.push(sessionId);
    }

    if (startTime) {
      whereParts.push('AND request_timestamp_ns >= ?');
      params.push(startTime);
    }

    if (endTime) {
      whereParts.push('AND request_timestamp_ns <= ?');
      params.push(endTime);
    }

    const whereClause = whereParts.join(' ');
    const statsQuery = `
      SELECT 
        COUNT(*) as total_conversations,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as errors,
        AVG(duration_ms) as avg_duration_ms,
        MIN(duration_ms) as min_duration_ms,
        MAX(duration_ms) as max_duration_ms
      FROM conversations
      ${whereClause}
    `;

    const stmt = this.db.prepare(statsQuery);
    return stmt.get(...params);
  }
}
