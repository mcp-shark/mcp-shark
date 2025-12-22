/**
 * Service for session-related business logic
 */
export class SessionService {
  constructor(sessionRepository, packetRepository, serializationLib) {
    this.sessionRepository = sessionRepository;
    this.packetRepository = packetRepository;
    this.serializationLib = serializationLib;
  }

  /**
   * Get sessions with filters
   */
  getSessions(filters = {}) {
    const sanitizedFilters = {
      startTime: filters.startTime ? BigInt(filters.startTime) : null,
      endTime: filters.endTime ? BigInt(filters.endTime) : null,
      limit: Number.parseInt(filters.limit) || 1000,
      offset: Number.parseInt(filters.offset) || 0,
    };

    const sessions = this.sessionRepository.getSessions(sanitizedFilters);
    return this.serializationLib.serializeBigInt(sessions);
  }

  /**
   * Get requests for a specific session
   */
  getSessionRequests(sessionId, limit = 10000) {
    const parsedLimit = Number.parseInt(limit) || 10000;
    const requests = this.packetRepository.getSessionRequests(sessionId, parsedLimit);
    return this.serializationLib.serializeBigInt(requests);
  }
}
