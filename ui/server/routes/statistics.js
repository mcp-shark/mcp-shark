import { serializeBigInt } from '../utils/serialization.js';
import { getStatistics } from 'mcp-shark-common/db/query.js';

export function createStatisticsRoutes(db) {
  const router = {};

  router.getStatistics = (req, res) => {
    const filters = {
      sessionId: req.query.sessionId || null,
      startTime: req.query.startTime ? BigInt(req.query.startTime) : null,
      endTime: req.query.endTime ? BigInt(req.query.endTime) : null,
    };
    const stats = getStatistics(db, filters);
    res.json(serializeBigInt(stats));
  };

  return router;
}
