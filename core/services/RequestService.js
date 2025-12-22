/**
 * Service for request-related business logic
 * Uses repositories for data access
 */
export class RequestService {
  constructor(packetRepository, serializationLib) {
    this.packetRepository = packetRepository;
    this.serializationLib = serializationLib;
  }

  /**
   * Get requests with filters
   */
  getRequests(filters = {}) {
    const sanitizedFilters = this._sanitizeFilters(filters);
    const requests = this.packetRepository.queryRequests(sanitizedFilters);
    return this.serializationLib.serializeBigInt(requests);
  }

  /**
   * Get request by frame number
   */
  getRequest(frameNumber) {
    const request = this.packetRepository.getByFrameNumber(Number.parseInt(frameNumber));
    if (!request) {
      return null;
    }
    return this.serializationLib.serializeBigInt(request);
  }

  /**
   * Clear all requests
   */
  clearRequests() {
    const result = this.packetRepository.clearAll();
    return {
      success: true,
      message: `Cleared ${result.clearedTables.length} table(s): ${result.clearedTables.join(', ')}. All captured traffic has been cleared.`,
    };
  }

  /**
   * Export requests in various formats
   */
  exportRequests(filters = {}, format = 'json') {
    const sanitizedFilters = {
      ...this._sanitizeFilters(filters),
      limit: 100000,
      offset: 0,
    };
    const requests = this.packetRepository.queryRequests(sanitizedFilters);

    if (format === 'csv') {
      return this._formatAsCsv(requests);
    }

    if (format === 'txt') {
      return this._formatAsTxt(requests);
    }

    return {
      content: JSON.stringify(this.serializationLib.serializeBigInt(requests), null, 2),
      contentType: 'application/json',
      extension: 'json',
    };
  }

  /**
   * Sanitize filter values
   */
  _sanitizeFilters(filters) {
    const sanitizeSearch = (value) => {
      if (value !== undefined && value !== null) {
        const trimmed = String(value).trim();
        return trimmed.length > 0 ? trimmed : null;
      }
      return null;
    };

    const sanitized = {
      sessionId: (filters.sessionId && String(filters.sessionId).trim()) || null,
      direction: (filters.direction && String(filters.direction).trim()) || null,
      method: (filters.method && String(filters.method).trim()) || null,
      jsonrpcMethod: (filters.jsonrpcMethod && String(filters.jsonrpcMethod).trim()) || null,
      statusCode: filters.statusCode ? Number.parseInt(filters.statusCode) : null,
      jsonrpcId: (filters.jsonrpcId && String(filters.jsonrpcId).trim()) || null,
      search: sanitizeSearch(filters.search),
      serverName: (filters.serverName && String(filters.serverName).trim()) || null,
      startTime: filters.startTime ? BigInt(filters.startTime) : null,
      endTime: filters.endTime ? BigInt(filters.endTime) : null,
      limit: filters.limit || 1000,
      offset: filters.offset || 0,
    };

    Object.keys(sanitized).forEach((key) => {
      if (sanitized[key] === undefined) {
        sanitized[key] = null;
      }
    });

    return sanitized;
  }

  /**
   * Format requests as CSV
   */
  _formatAsCsv(requests) {
    const headers = [
      'Frame',
      'Time',
      'Source',
      'Destination',
      'Protocol',
      'Length',
      'Method',
      'Status',
      'JSON-RPC Method',
      'Session ID',
      'Server Name',
    ];
    const rows = requests.map((req) => [
      req.frame_number || '',
      req.timestamp_iso || '',
      req.request?.host || '',
      req.request?.host || '',
      'HTTP',
      req.length || '',
      req.request?.method || '',
      req.response?.status_code || '',
      req.jsonrpc_method || '',
      req.session_id || '',
      req.server_name || '',
    ]);

    const content = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return { content, contentType: 'text/csv', extension: 'csv' };
  }

  /**
   * Format requests as TXT
   */
  _formatAsTxt(requests) {
    const content = requests
      .map((req, idx) => {
        const lines = [
          `=== Request/Response #${idx + 1} (Frame ${req.frame_number || 'N/A'}) ===`,
          `Time: ${req.timestamp_iso || 'N/A'}`,
          `Session ID: ${req.session_id || 'N/A'}`,
          `Server: ${req.server_name || 'N/A'}`,
          `Direction: ${req.direction || 'N/A'}`,
          `Method: ${req.request?.method || 'N/A'}`,
          `Status: ${req.response?.status_code || 'N/A'}`,
          `JSON-RPC Method: ${req.jsonrpc_method || 'N/A'}`,
          `JSON-RPC ID: ${req.jsonrpc_id || 'N/A'}`,
          `Length: ${req.length || 0} bytes`,
          '',
          'Request:',
          JSON.stringify(req.request || {}, null, 2),
          '',
          'Response:',
          JSON.stringify(req.response || {}, null, 2),
          '',
          '---',
          '',
        ];
        return lines.join('\n');
      })
      .join('\n');

    return { content, contentType: 'text/plain', extension: 'txt' };
  }
}
