import { StatusCodes } from '#core/constants/StatusCodes.js';
import { ExportFormat } from '#core/models/ExportFormat.js';
/**
 * Controller for request-related HTTP endpoints
 * Handles HTTP concerns: extraction, sanitization, serialization, formatting
 */
import { RequestFilters } from '#core/models/RequestFilters.js';

export class RequestController {
  constructor(requestService, serializationLib, logger) {
    this.requestService = requestService;
    this.serializationLib = serializationLib;
    this.logger = logger;
  }

  /**
   * Sanitize search parameter
   */
  _sanitizeSearch(value) {
    if (value !== undefined && value !== null) {
      const trimmed = String(value).trim();
      return trimmed.length > 0 ? trimmed : null;
    }
    return null;
  }

  /**
   * Extract and sanitize filters from HTTP query
   */
  _extractFilters(reqQuery) {
    return new RequestFilters({
      sessionId: reqQuery.sessionId ? String(reqQuery.sessionId).trim() : null,
      direction: reqQuery.direction ? String(reqQuery.direction).trim() : null,
      method: reqQuery.method ? String(reqQuery.method).trim() : null,
      jsonrpcMethod: reqQuery.jsonrpcMethod ? String(reqQuery.jsonrpcMethod).trim() : null,
      statusCode: reqQuery.statusCode ? Number.parseInt(reqQuery.statusCode) : null,
      jsonrpcId: reqQuery.jsonrpcId ? String(reqQuery.jsonrpcId).trim() : null,
      search: this._sanitizeSearch(reqQuery.search),
      serverName: reqQuery.serverName ? String(reqQuery.serverName).trim() : null,
      startTime: reqQuery.startTime || null,
      endTime: reqQuery.endTime || null,
      limit: reqQuery.limit,
      offset: reqQuery.offset,
    });
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

  /**
   * GET /api/requests
   */
  getRequests(req, res) {
    try {
      const filters = this._extractFilters(req.query);
      const requests = this.requestService.getRequests(filters);
      const serialized = this.serializationLib.serializeBigInt(requests);
      res.json(serialized);
    } catch (error) {
      this.logger.error({ error: error.message }, 'Error in getRequests');
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to query requests',
        details: error.message,
      });
    }
  }

  /**
   * GET /api/requests/:frameNumber
   */
  getRequest(req, res) {
    try {
      const request = this.requestService.getRequest(req.params.frameNumber);
      if (!request) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: 'Request not found' });
      }
      const serialized = this.serializationLib.serializeBigInt(request);
      res.json(serialized);
    } catch (error) {
      this.logger.error({ error: error.message }, 'Error in getRequest');
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to get request',
        details: error.message,
      });
    }
  }

  /**
   * POST /api/requests/clear
   */
  clearRequests(_req, res) {
    try {
      const result = this.requestService.clearRequests();
      res.json({
        success: true,
        message: `Cleared ${result.clearedTables.length} table(s): ${result.clearedTables.join(', ')}. All captured traffic has been cleared.`,
      });
    } catch (error) {
      this.logger.error({ error: error.message }, 'Error clearing requests');
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to clear traffic',
        details: error.message,
      });
    }
  }

  /**
   * GET /api/requests/export
   */
  exportRequests(req, res) {
    try {
      const format = req.query.format || ExportFormat.JSON;
      const filters = this._extractFilters(req.query);
      const requests = this.requestService.getRequestsForExport(filters);

      const getExportResult = () => {
        if (format === ExportFormat.CSV) {
          return this._formatAsCsv(requests);
        }
        if (format === ExportFormat.TXT) {
          return this._formatAsTxt(requests);
        }
        const serialized = this.serializationLib.serializeBigInt(requests);
        return {
          content: JSON.stringify(serialized, null, 2),
          contentType: 'application/json',
          extension: 'json',
        };
      };

      const result = getExportResult();

      const filename = `mcp-shark-traffic-${new Date().toISOString().replace(/[:.]/g, '-')}.${result.extension}`;
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(result.content);
    } catch (error) {
      this.logger.error({ error: error.message }, 'Error exporting requests');
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to export traffic',
        details: error.message,
      });
    }
  }
}
