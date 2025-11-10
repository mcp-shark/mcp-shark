import { serializeBigInt } from '../utils/serialization.js';
import { getSessions, getSessionRequests } from 'mcp-shark-common/db/query.js';

export function createSessionsRoutes(db) {
  const router = {};

  router.getSessions = (req, res) => {
    const limit = parseInt(req.query.limit) || 1000;
    const offset = parseInt(req.query.offset) || 0;
    const filters = {
      startTime: req.query.startTime ? BigInt(req.query.startTime) : null,
      endTime: req.query.endTime ? BigInt(req.query.endTime) : null,
      limit,
      offset,
    };
    const sessions = getSessions(db, filters);
    res.json(serializeBigInt(sessions));
  };

  router.getSessionRequests = (req, res) => {
    const limit = parseInt(req.query.limit) || 10000;
    const requests = getSessionRequests(db, req.params.sessionId, limit);
    res.json(serializeBigInt(requests));
  };

  return router;
}
