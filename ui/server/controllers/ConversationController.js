import { StatusCodes } from '#core/constants/StatusCodes.js';
/**
 * Controller for conversation-related HTTP endpoints
 */
import { ConversationFilters } from '#core/models/ConversationFilters.js';

export class ConversationController {
  constructor(conversationService, serializationLib, logger) {
    this.conversationService = conversationService;
    this.serializationLib = serializationLib;
    this.logger = logger;
  }

  /**
   * GET /api/conversations
   */
  getConversations(req, res) {
    try {
      const filters = new ConversationFilters({
        sessionId: req.query.sessionId || null,
        method: req.query.method || null,
        status: req.query.status || null,
        jsonrpcId: req.query.jsonrpcId || null,
        startTime: req.query.startTime || null,
        endTime: req.query.endTime || null,
        limit: req.query.limit,
        offset: req.query.offset,
      });
      const conversations = this.conversationService.getConversations(filters);
      const serialized = this.serializationLib.serializeBigInt(conversations);
      res.json(serialized);
    } catch (error) {
      this.logger.error({ error: error.message }, 'Error in getConversations');
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to query conversations',
        details: error.message,
      });
    }
  }
}
