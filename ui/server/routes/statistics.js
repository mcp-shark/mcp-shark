import { queryRequests } from 'mcp-shark-common/db/query.js';
import { serializeBigInt } from '../utils/serialization.js';

const sanitizeSearch = (value) => {
  if (value !== undefined && value !== null) {
    const trimmed = String(value).trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
};

export function createStatisticsRoutes(db) {
  const router = {};

  router.getStatistics = (req, res) => {
    try {
      // Sanitize search parameter - convert empty strings to null
      const search = sanitizeSearch(req.query.search);

      // Build filters object matching the requests route
      const filters = {
        sessionId: (req.query.sessionId && String(req.query.sessionId).trim()) || null,
        direction: (req.query.direction && String(req.query.direction).trim()) || null,
        method: (req.query.method && String(req.query.method).trim()) || null,
        jsonrpcMethod: (req.query.jsonrpcMethod && String(req.query.jsonrpcMethod).trim()) || null,
        statusCode: req.query.statusCode ? Number.parseInt(req.query.statusCode) : null,
        jsonrpcId: (req.query.jsonrpcId && String(req.query.jsonrpcId).trim()) || null,
        search: search,
        serverName: (req.query.serverName && String(req.query.serverName).trim()) || null,
        startTime: req.query.startTime ? BigInt(req.query.startTime) : null,
        endTime: req.query.endTime ? BigInt(req.query.endTime) : null,
        limit: 1000000, // Large limit for accurate statistics
        offset: 0,
      };

      // Remove undefined values to avoid issues
      Object.keys(filters).forEach((key) => {
        if (filters[key] === undefined) {
          filters[key] = null;
        }
      });

      // Get all filtered requests (no limit for accurate statistics)
      const allRequests = queryRequests(db, filters);

      // Calculate statistics from filtered requests
      const totalPackets = allRequests.length;
      const totalRequests = allRequests.filter((r) => r.direction === 'request').length;
      const totalResponses = allRequests.filter((r) => r.direction === 'response').length;
      const totalErrors = allRequests.filter((r) => {
        if (r.direction === 'response') {
          const statusCode = r.status_code || r.status;
          return (
            statusCode >= 400 ||
            (r.body_json && typeof r.body_json === 'object' && r.body_json.error)
          );
        }
        return false;
      }).length;

      // Get unique sessions
      const uniqueSessions = new Set();
      allRequests.forEach((r) => {
        if (r.session_id) {
          uniqueSessions.add(r.session_id);
        }
      });

      const stats = {
        total_packets: totalPackets,
        total_requests: totalRequests,
        total_responses: totalResponses,
        total_errors: totalErrors,
        unique_sessions: uniqueSessions.size,
      };

      res.json(serializeBigInt(stats));
    } catch (error) {
      console.error('Error in getStatistics:', error);
      res.status(500).json({ error: 'Failed to get statistics', details: error.message });
    }
  };

  return router;
}
