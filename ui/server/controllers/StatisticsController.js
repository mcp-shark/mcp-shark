import { StatusCodes } from '#core/constants/StatusCodes.js';
/**
 * Controller for statistics-related HTTP endpoints
 */
import { RequestFilters } from '#core/models/RequestFilters.js';

export class StatisticsController {
  constructor(statisticsService, serializationLib, logger) {
    this.statisticsService = statisticsService;
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
   * GET /api/statistics
   */
  getStatistics(req, res) {
    try {
      const filters = new RequestFilters({
        sessionId: req.query.sessionId ? String(req.query.sessionId).trim() : null,
        direction: req.query.direction ? String(req.query.direction).trim() : null,
        method: req.query.method ? String(req.query.method).trim() : null,
        jsonrpcMethod: req.query.jsonrpcMethod ? String(req.query.jsonrpcMethod).trim() : null,
        statusCode: req.query.statusCode ? Number.parseInt(req.query.statusCode) : null,
        jsonrpcId: req.query.jsonrpcId ? String(req.query.jsonrpcId).trim() : null,
        search: this._sanitizeSearch(req.query.search),
        serverName: req.query.serverName ? String(req.query.serverName).trim() : null,
        startTime: req.query.startTime || null,
        endTime: req.query.endTime || null,
      });
      const stats = this.statisticsService.getStatistics(filters);
      const serialized = this.serializationLib.serializeBigInt(stats);
      res.json(serialized);
    } catch (error) {
      this.logger.error({ error: error.message }, 'Error in getStatistics');
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to get statistics',
        details: error.message,
      });
    }
  }
}
