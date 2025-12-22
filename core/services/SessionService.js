/**
 * Service for session-related business logic
 * HTTP-agnostic: accepts models, returns models
 */
import { Defaults } from '../constants/Defaults.js';

export class SessionService {
  constructor(sessionRepository, packetRepository) {
    this.sessionRepository = sessionRepository;
    this.packetRepository = packetRepository;
  }

  /**
   * Get sessions with filters
   * @param {SessionFilters} filters - Typed filter model
   * @returns {Array} Array of session objects (raw from repository)
   */
  getSessions(filters) {
    const repoFilters = filters.toRepositoryFilters();
    return this.sessionRepository.getSessions(repoFilters);
  }

  /**
   * Get requests for a specific session
   * @param {string} sessionId - Session ID
   * @param {number} limit - Maximum number of requests to return
   * @returns {Array} Array of packet objects (raw from repository)
   */
  getSessionRequests(sessionId, limit) {
    const parsedLimit =
      limit !== undefined ? Number.parseInt(limit) : Defaults.DEFAULT_SESSION_LIMIT;
    return this.packetRepository.getSessionRequests(sessionId, parsedLimit);
  }
}
