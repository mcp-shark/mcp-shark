/**
 * Service for statistics-related business logic
 */
export class StatisticsService {
  constructor(statisticsRepository, packetRepository, conversationRepository, serializationLib) {
    this.statisticsRepository = statisticsRepository;
    this.packetRepository = packetRepository;
    this.conversationRepository = conversationRepository;
    this.serializationLib = serializationLib;
  }

  /**
   * Get statistics with filters
   */
  getStatistics(filters = {}) {
    const sanitizeSearch = (value) => {
      if (value !== undefined && value !== null) {
        const trimmed = String(value).trim();
        return trimmed.length > 0 ? trimmed : null;
      }
      return null;
    };

    const sanitizedFilters = {
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
    };

    Object.keys(sanitizedFilters).forEach((key) => {
      if (sanitizedFilters[key] === undefined) {
        sanitizedFilters[key] = null;
      }
    });

    // Get all filtered requests for accurate statistics
    const allRequests = this.packetRepository.queryRequests({
      ...sanitizedFilters,
      limit: 1000000,
      offset: 0,
    });

    // Calculate statistics from filtered requests
    const totalPackets = allRequests.length;
    const totalRequests = allRequests.filter((r) => r.direction === 'request').length;
    const totalResponses = allRequests.filter((r) => r.direction === 'response').length;
    const totalErrors = allRequests.filter((r) => {
      if (r.direction === 'response') {
        const statusCode = r.status_code || r.status;
        return (
          statusCode >= 400 || (r.body_json && typeof r.body_json === 'object' && r.body_json.error)
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

    return this.serializationLib.serializeBigInt(stats);
  }
}
