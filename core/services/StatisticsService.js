import { Defaults } from '../constants/Defaults.js';
import { StatusCodeRanges } from '../constants/StatusCodes.js';
/**
 * Service for statistics-related business logic
 * HTTP-agnostic: accepts models, returns models
 */
import { RequestFilters } from '../models/RequestFilters.js';

export class StatisticsService {
  constructor(statisticsRepository, packetRepository, conversationRepository) {
    this.statisticsRepository = statisticsRepository;
    this.packetRepository = packetRepository;
    this.conversationRepository = conversationRepository;
  }

  /**
   * Get statistics with filters
   * @param {RequestFilters} filters - Typed filter model
   * @returns {Object} Statistics object
   */
  getStatistics(filters) {
    // Get all filtered requests for accurate statistics
    const statsFilters = new RequestFilters({
      ...filters,
      limit: Defaults.STATISTICS_LIMIT,
      offset: Defaults.DEFAULT_OFFSET,
    });
    const repoFilters = statsFilters.toRepositoryFilters();
    const allRequests = this.packetRepository.queryRequests(repoFilters);

    // Calculate statistics from filtered requests
    const totalPackets = allRequests.length;
    const totalRequests = allRequests.filter((r) => r.direction === 'request').length;
    const totalResponses = allRequests.filter((r) => r.direction === 'response').length;
    const totalErrors = allRequests.filter((r) => {
      if (r.direction === 'response') {
        const statusCode = r.status_code || r.status;
        return (
          statusCode >= StatusCodeRanges.CLIENT_ERROR_MIN ||
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

    return stats;
  }
}
