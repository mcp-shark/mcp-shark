/**
 * Query functions for forensic analysis of HTTP packets
 * Can be used independently in other projects
 */

/**
 * Query packets with forensic filters
 */
export function queryPackets(db, filters = {}) {
  const {
    sessionId = null,
    direction = null,
    method = null,
    jsonrpcMethod = null,
    statusCode = null,
    startTime = null,
    endTime = null,
    jsonrpcId = null,
    limit = 1000,
    offset = 0,
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
  const stmt = db.prepare(query);
  return stmt.all(...params);
}

/**
 * Enhanced query function for requests/responses with search and server name filtering
 * Supports partial matching and general search across multiple fields
 */
export function queryRequests(db, filters = {}) {
  const {
    sessionId = null,
    direction = null,
    method = null,
    jsonrpcMethod = null,
    statusCode = null,
    startTime = null,
    endTime = null,
    jsonrpcId = null,
    search = null, // General search across multiple fields
    serverName = null, // MCP server name filter
    limit = 1000,
    offset = 0,
  } = filters;

  const queryParts = ['SELECT * FROM packets WHERE 1=1'];
  const params = [];

  // General search - searches across multiple fields with partial matching
  // Also searches for server names in JSON-RPC params (e.g., "params":{"name":"server-name.tool")
  if (search) {
    const searchPattern = `%${search}%`;
    // Also create a pattern to search for server name in params (e.g., "name":"server-name")
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
      -- Search for server name in JSON-RPC params (e.g., "params":{"name":"server-name.tool")
      body_json LIKE ? ESCAPE '\\' OR
      body_raw LIKE ? ESCAPE '\\'
    )`);
    // Add the pattern for each field (11 regular fields + 2 server name fields = 13 total)
    const patternCount = 11;
    for (const _i of Array(patternCount).keys()) {
      params.push(searchPattern);
    }
    // Add server name specific patterns
    params.push(serverNamePattern);
    params.push(serverNamePattern);
  }

  // Specific field filters with partial matching
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

  // Filter by MCP server name - search in JSON-RPC params
  // Server names appear as "params":{"name":"server-name.tool-name" or "name":"server-name.tool-name"
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
  const stmt = db.prepare(query);
  return stmt.all(...params);
}

/**
 * Get conversation flow (request/response pairs)
 */
export function queryConversations(db, filters = {}) {
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
  const stmt = db.prepare(query);
  return stmt.all(...params);
}

/**
 * Get all packets for a specific session (for forensic analysis)
 */
export function getSessionPackets(db, sessionId, limit = 10000) {
  const stmt = db.prepare(`
    SELECT * FROM packets
    WHERE session_id = ?
    ORDER BY timestamp_ns ASC
    LIMIT ?
  `);
  return stmt.all(sessionId, limit);
}

/**
 * Get all requests for a specific session (ordered by most recent first)
 */
export function getSessionRequests(db, sessionId, limit = 10000) {
  const stmt = db.prepare(`
    SELECT * FROM packets
    WHERE session_id = ?
    ORDER BY timestamp_ns DESC
    LIMIT ?
  `);
  return stmt.all(sessionId, limit);
}

/**
 * Get session metadata
 */
export function getSessions(db, filters = {}) {
  const { startTime = null, endTime = null, limit = 1000, offset = 0 } = filters;

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
  const stmt = db.prepare(query);
  return stmt.all(...params);
}

/**
 * Get statistics for forensic analysis
 */
export function getStatistics(db, filters = {}) {
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
      COUNT(CASE WHEN status_code >= 400 THEN 1 END) as total_errors,
      COUNT(DISTINCT session_id) as unique_sessions,
      AVG(length) as avg_packet_size,
      SUM(length) as total_bytes,
      MIN(timestamp_ns) as first_packet_ns,
      MAX(timestamp_ns) as last_packet_ns
    FROM packets
    ${whereClause}
  `;

  const stmt = db.prepare(statsQuery);
  return stmt.get(...params);
}

/**
 * Get conversation statistics
 */
export function getConversationStatistics(db, filters = {}) {
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

  const stmt = db.prepare(statsQuery);
  return stmt.get(...params);
}
