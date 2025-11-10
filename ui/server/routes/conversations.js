import { serializeBigInt } from '../utils/serialization.js';
import { queryConversations } from 'mcp-shark-common/db/query.js';

export function createConversationsRoutes(db) {
  const router = {};

  router.getConversations = (req, res) => {
    const limit = parseInt(req.query.limit) || 1000;
    const offset = parseInt(req.query.offset) || 0;
    const filters = {
      sessionId: req.query.sessionId || null,
      method: req.query.method || null,
      status: req.query.status || null,
      jsonrpcId: req.query.jsonrpcId || null,
      startTime: req.query.startTime ? BigInt(req.query.startTime) : null,
      endTime: req.query.endTime ? BigInt(req.query.endTime) : null,
      limit,
      offset,
    };
    const conversations = queryConversations(db, filters);
    res.json(serializeBigInt(conversations));
  };

  return router;
}
