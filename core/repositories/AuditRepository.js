/**
 * Repository for audit logging operations
 * Handles logging of request and response packets
 */
export class AuditRepository {
  constructor(db) {
    this.db = db;
  }

  /**
   * Get timestamp in nanoseconds
   */
  _getTimestampNs() {
    return Number(process.hrtime.bigint());
  }

  /**
   * Get timestamp in ISO format
   */
  _getTimestampISO() {
    return new Date().toISOString();
  }

  /**
   * Calculate duration in milliseconds
   */
  _calculateDurationMs(startNs, endNs) {
    return (endNs - startNs) / 1_000_000;
  }

  /**
   * Normalize session ID from various header formats
   */
  _normalizeSessionId(headers) {
    if (!headers || typeof headers !== 'object') {
      return null;
    }

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
  _extractJsonRpcMetadata(bodyJson) {
    if (!bodyJson) {
      return { id: null, method: null, result: null, error: null };
    }

    try {
      const parsed = typeof bodyJson === 'string' ? JSON.parse(bodyJson) : bodyJson;
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
  _generateInfo(direction, method, url, statusCode, jsonrpcMethod) {
    if (direction === 'request') {
      const rpcInfo = jsonrpcMethod ? ` ${jsonrpcMethod}` : '';
      return `${method} ${url}${rpcInfo}`;
    }

    const rpcInfo = jsonrpcMethod ? ` ${jsonrpcMethod}` : '';
    return `${statusCode}${rpcInfo}`;
  }

  /**
   * Normalize body to raw string and JSON
   */
  _normalizeBody(body) {
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
  }

  /**
   * Log an HTTP request packet
   */
  logRequestPacket(options) {
    const {
      method,
      url,
      headers = {},
      body,
      userAgent = null,
      remoteAddress = null,
      sessionId: providedSessionId = null,
    } = options;

    const timestampNs = this._getTimestampNs();
    const timestampISO = this._getTimestampISO();
    const sessionId = providedSessionId || this._normalizeSessionId(headers);
    const host = headers.host || headers.Host || null;

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

    const jsonrpc = this._extractJsonRpcMetadata(bodyJson || bodyRaw);
    const jsonrpcId = jsonrpc.id;
    const jsonrpcMethod = jsonrpc.method;

    const length = Buffer.byteLength(headersJson, 'utf8') + Buffer.byteLength(bodyRaw, 'utf8');
    const info = this._generateInfo('request', method, url, null, jsonrpcMethod);

    const stmt = this.db.prepare(`
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

    return { frameNumber, timestampNs, jsonrpcId, sessionId };
  }

  /**
   * Log an HTTP response packet
   */
  logResponsePacket(options) {
    const {
      statusCode,
      headers = {},
      body,
      requestFrameNumber: _requestFrameNumber = null,
      requestTimestampNs: _requestTimestampNs = null,
      jsonrpcId = null,
      userAgent = null,
      remoteAddress = null,
      sessionId: providedSessionId = null,
    } = options;

    const timestampNs = this._getTimestampNs();
    const timestampISO = this._getTimestampISO();
    const sessionId = providedSessionId || this._normalizeSessionId(headers);
    const host = headers.host || headers.Host || null;

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

    const jsonrpc = this._extractJsonRpcMetadata(bodyJson || bodyRaw);
    const jsonrpcIdFromBody = jsonrpc.id || jsonrpcId;
    const jsonrpcMethod = jsonrpc.method;
    const jsonrpcResult = jsonrpc.result;
    const jsonrpcError = jsonrpc.error;

    const length = Buffer.byteLength(headersJson, 'utf8') + Buffer.byteLength(bodyRaw, 'utf8');
    const info = this._generateInfo('response', null, null, statusCode, jsonrpcMethod);

    const stmt = this.db.prepare(`
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

    return { frameNumber, timestampNs, jsonrpcId: jsonrpcIdFromBody, sessionId };
  }
}
