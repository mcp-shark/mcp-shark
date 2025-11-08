/**
 * Helper functions for logging HTTP packets to the database for forensic analysis
 */

function getTimestampNs() {
  return Number(process.hrtime.bigint());
}

function getTimestampISO() {
  return new Date().toISOString();
}

function calculateDurationMs(startNs, endNs) {
  return (endNs - startNs) / 1_000_000;
}

/**
 * Normalize session ID from various header formats
 * Supports: mcp-session-id, Mcp-Session-Id, X-MCP-Session-Id
 */
function normalizeSessionId(headers) {
  if (!headers || typeof headers !== 'object') {
    return null;
  }

  // Check all possible header formats (case-insensitive)
  const sessionHeaderKeys = [
    'mcp-session-id',
    'Mcp-Session-Id',
    'X-MCP-Session-Id',
    'x-mcp-session-id',
    'MCP-Session-Id',
  ];

  for (const key of sessionHeaderKeys) {
    if (headers[key]) {
      return headers[key];
    }
  }

  return null;
}

/**
 * Extract JSON-RPC metadata from body
 */
function extractJsonRpcMetadata(bodyJson) {
  if (!bodyJson) {
    return { id: null, method: null, result: null, error: null };
  }

  try {
    const parsed =
      typeof bodyJson === 'string' ? JSON.parse(bodyJson) : bodyJson;
    return {
      id: parsed.id !== undefined ? String(parsed.id) : null,
      method: parsed.method || null,
      result: parsed.result ? JSON.stringify(parsed.result) : null,
      error: parsed.error ? JSON.stringify(parsed.error) : null,
    };
  } catch {
    return { id: null, method: null, result: null, error: null };
  }
}

/**
 * Generate info summary for quick packet identification
 */
function generateInfo(direction, method, url, statusCode, jsonrpcMethod) {
  if (direction === 'request') {
    const rpcInfo = jsonrpcMethod ? ` ${jsonrpcMethod}` : '';
    return `${method} ${url}${rpcInfo}`;
  } else {
    const rpcInfo = jsonrpcMethod ? ` ${jsonrpcMethod}` : '';
    return `${statusCode}${rpcInfo}`;
  }
}

/**
 * Log an HTTP request packet
 */
function logRequestPacket(db, options) {
  const {
    method,
    url,
    headers = {},
    body,
    userAgent = null,
    remoteAddress = null,
  } = options;

  const timestampNs = getTimestampNs();
  const timestampISO = getTimestampISO();
  const sessionId = normalizeSessionId(headers);
  const host = headers.host || headers.Host || null;

  // Prepare body data
  const { bodyRaw, bodyJson } = (() => {
    if (!body) {
      return { bodyRaw: '', bodyJson: null };
    }
    if (typeof body === 'string') {
      return { bodyRaw: body, bodyJson: body };
    }
    if (typeof body === 'object') {
      const raw = JSON.stringify(body);
      return { bodyRaw: raw, bodyJson: raw };
    }
    return { bodyRaw: '', bodyJson: null };
  })();
  const headersJson = JSON.stringify(headers);

  // Extract JSON-RPC metadata
  const jsonrpc = extractJsonRpcMetadata(bodyJson || bodyRaw);
  const jsonrpcId = jsonrpc.id;
  const jsonrpcMethod = jsonrpc.method;

  // Calculate packet length
  const length =
    Buffer.byteLength(headersJson, 'utf8') + Buffer.byteLength(bodyRaw, 'utf8');

  // Generate info summary
  const info = generateInfo('request', method, url, null, jsonrpcMethod);

  const stmt = db.prepare(`
    INSERT INTO packets (
      timestamp_ns,
      timestamp_iso,
      direction,
      protocol,
      session_id,
      method,
      url,
      headers_json,
      body_raw,
      body_json,
      jsonrpc_id,
      jsonrpc_method,
      length,
      info,
      user_agent,
      remote_address,
      host
    ) VALUES (?, ?, 'request', 'HTTP', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    timestampNs,
    timestampISO,
    sessionId,
    method,
    url,
    headersJson,
    bodyRaw,
    bodyJson,
    jsonrpcId,
    jsonrpcMethod,
    length,
    info,
    userAgent,
    remoteAddress,
    host
  );

  const frameNumber = result.lastInsertRowid;

  // Update or create session record
  if (sessionId) {
    const sessionStmt = db.prepare(`
      INSERT INTO sessions (session_id, first_seen_ns, last_seen_ns, packet_count, user_agent, remote_address, host)
      VALUES (?, ?, ?, 1, ?, ?, ?)
      ON CONFLICT(session_id) DO UPDATE SET
        last_seen_ns = excluded.last_seen_ns,
        packet_count = packet_count + 1,
        user_agent = COALESCE(excluded.user_agent, user_agent),
        remote_address = COALESCE(excluded.remote_address, remote_address),
        host = COALESCE(excluded.host, host)
    `);
    sessionStmt.run(
      sessionId,
      timestampNs,
      timestampNs,
      userAgent,
      remoteAddress,
      host
    );
  }

  // Create conversation entry for request
  if (jsonrpcId) {
    const convStmt = db.prepare(`
      INSERT INTO conversations (
        request_frame_number,
        session_id,
        jsonrpc_id,
        method,
        request_timestamp_ns,
        status
      ) VALUES (?, ?, ?, ?, ?, 'pending')
    `);
    convStmt.run(
      frameNumber,
      sessionId,
      jsonrpcId,
      jsonrpcMethod || method,
      timestampNs
    );
  }

  return { frameNumber, timestampNs };
}

/**
 * Log an HTTP response packet
 */
function logResponsePacket(db, options) {
  const {
    statusCode,
    headers = {},
    body,
    requestFrameNumber = null,
    requestTimestampNs = null,
    jsonrpcId = null,
    userAgent = null,
    remoteAddress = null,
  } = options;

  const timestampNs = getTimestampNs();
  const timestampISO = getTimestampISO();
  const sessionId = normalizeSessionId(headers);
  const host = headers.host || headers.Host || null;

  // Prepare body data
  const { bodyRaw, bodyJson } = (() => {
    if (!body) {
      return { bodyRaw: '', bodyJson: null };
    }
    if (typeof body === 'string') {
      return { bodyRaw: body, bodyJson: body };
    }
    if (typeof body === 'object') {
      const raw = JSON.stringify(body);
      return { bodyRaw: raw, bodyJson: raw };
    }
    return { bodyRaw: '', bodyJson: null };
  })();
  const headersJson = JSON.stringify(headers);

  // Extract JSON-RPC metadata
  const jsonrpc = extractJsonRpcMetadata(bodyJson || bodyRaw);
  const jsonrpcIdFromBody = jsonrpc.id || jsonrpcId;
  const jsonrpcMethod = jsonrpc.method;
  const jsonrpcResult = jsonrpc.result;
  const jsonrpcError = jsonrpc.error;

  // Calculate packet length
  const length =
    Buffer.byteLength(headersJson, 'utf8') + Buffer.byteLength(bodyRaw, 'utf8');

  // Generate info summary
  const info = generateInfo('response', null, null, statusCode, jsonrpcMethod);

  const stmt = db.prepare(`
    INSERT INTO packets (
      timestamp_ns,
      timestamp_iso,
      direction,
      protocol,
      session_id,
      status_code,
      headers_json,
      body_raw,
      body_json,
      jsonrpc_id,
      jsonrpc_method,
      jsonrpc_result,
      jsonrpc_error,
      length,
      info,
      user_agent,
      remote_address,
      host
    ) VALUES (?, ?, 'response', 'HTTP', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    timestampNs,
    timestampISO,
    sessionId,
    statusCode,
    headersJson,
    bodyRaw,
    bodyJson,
    jsonrpcIdFromBody,
    jsonrpcMethod,
    jsonrpcResult,
    jsonrpcError,
    length,
    info,
    userAgent,
    remoteAddress,
    host
  );

  const frameNumber = result.lastInsertRowid;

  // Update session record
  if (sessionId) {
    const sessionStmt = db.prepare(`
      INSERT INTO sessions (session_id, first_seen_ns, last_seen_ns, packet_count, user_agent, remote_address, host)
      VALUES (?, ?, ?, 1, ?, ?, ?)
      ON CONFLICT(session_id) DO UPDATE SET
        last_seen_ns = excluded.last_seen_ns,
        packet_count = packet_count + 1,
        user_agent = COALESCE(excluded.user_agent, user_agent),
        remote_address = COALESCE(excluded.remote_address, remote_address),
        host = COALESCE(excluded.host, host)
    `);
    sessionStmt.run(
      sessionId,
      timestampNs,
      timestampNs,
      userAgent,
      remoteAddress,
      host
    );
  }

  // Update conversation entry with response
  if (jsonrpcIdFromBody || requestFrameNumber) {
    const durationMs = requestTimestampNs
      ? calculateDurationMs(requestTimestampNs, timestampNs)
      : null;

    const status =
      statusCode >= 200 && statusCode < 300 ? 'completed' : 'error';

    if (requestFrameNumber) {
      // Update existing conversation
      const updateConvStmt = db.prepare(`
        UPDATE conversations
        SET response_frame_number = ?,
            response_timestamp_ns = ?,
            duration_ms = ?,
            status = ?
        WHERE request_frame_number = ?
      `);
      updateConvStmt.run(
        frameNumber,
        timestampNs,
        durationMs,
        status,
        requestFrameNumber
      );
    } else if (jsonrpcIdFromBody) {
      // Try to find conversation by JSON-RPC ID
      const findConvStmt = db.prepare(`
        SELECT request_frame_number FROM conversations
        WHERE jsonrpc_id = ? AND response_frame_number IS NULL
        ORDER BY request_timestamp_ns DESC
        LIMIT 1
      `);
      const conv = findConvStmt.get(jsonrpcIdFromBody);
      if (conv) {
        const updateConvStmt = db.prepare(`
          UPDATE conversations
          SET response_frame_number = ?,
              response_timestamp_ns = ?,
              duration_ms = ?,
              status = ?
          WHERE request_frame_number = ?
        `);
        updateConvStmt.run(
          frameNumber,
          timestampNs,
          durationMs,
          status,
          conv.request_frame_number
        );
      }
    }
  }

  return frameNumber;
}

export function getLogger(db) {
  return {
    logRequestPacket: logRequestPacket.bind(null, db),
    logResponsePacket: logResponsePacket.bind(null, db),
  };
}
