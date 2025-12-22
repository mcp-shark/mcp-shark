import { Defaults } from '#core/constants/Defaults.js';
import { StatusCodes } from '#core/constants/StatusCodes.js';
import { SessionFilters } from '#core/models/SessionFilters.js';

/**
 * Controller for session-related HTTP endpoints
 */

export class SessionController {
  constructor(sessionService, serializationLib, logger) {
    this.sessionService = sessionService;
    this.serializationLib = serializationLib;
    this.logger = logger;
  }

  /**
   * GET /api/sessions
   */
  getSessions(req, res) {
    try {
      const filters = new SessionFilters({
        startTime: req.query.startTime || null,
        endTime: req.query.endTime || null,
        limit: req.query.limit,
        offset: req.query.offset,
      });
      const sessions = this.sessionService.getSessions(filters);
      const serialized = this.serializationLib.serializeBigInt(sessions);
      res.json(serialized);
    } catch (error) {
      this.logger.error({ error: error.message }, 'Error in getSessions');
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to query sessions',
        details: error.message,
      });
    }
  }

  /**
   * GET /api/sessions/:sessionId/requests
   */
  getSessionRequests(req, res) {
    try {
      const sessionId = req.params.sessionId;
      const limit = req.query.limit || Defaults.DEFAULT_SESSION_LIMIT;
      const requests = this.sessionService.getSessionRequests(sessionId, limit);
      const serialized = this.serializationLib.serializeBigInt(requests);
      res.json(serialized);
    } catch (error) {
      this.logger.error({ error: error.message }, 'Error in getSessionRequests');
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to get session requests',
        details: error.message,
      });
    }
  }
}
