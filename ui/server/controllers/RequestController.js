import { StatusCodes } from '#core/constants/StatusCodes.js';
import { ExportFormat } from '#core/models/ExportFormat.js';
import { RequestFilters } from '#core/models/RequestFilters.js';

/**
 * Controller for request-related HTTP endpoints
 * Handles HTTP concerns: extraction, sanitization, serialization, formatting
 */

export class RequestController {
  constructor(requestService, exportService, serializationLib, logger) {
    this.requestService = requestService;
    this.exportService = exportService;
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

      const result = this.exportService.exportRequests(requests, format, this.serializationLib);

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
