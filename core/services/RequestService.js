import { Defaults } from '../constants/Defaults.js';
/**
 * Service for request-related business logic
 * Uses repositories for data access
 * HTTP-agnostic: accepts models, returns models
 */
import { RequestFilters } from '../models/RequestFilters.js';

export class RequestService {
  constructor(packetRepository) {
    this.packetRepository = packetRepository;
  }

  /**
   * Get requests with filters
   * @param {RequestFilters} filters - Typed filter model
   * @returns {Array} Array of packet objects (raw from repository)
   */
  getRequests(filters) {
    const repoFilters = filters.toRepositoryFilters();
    return this.packetRepository.queryRequests(repoFilters);
  }

  /**
   * Get request by frame number
   * @param {number} frameNumber - Frame number
   * @returns {Object|null} Packet object or null if not found
   */
  getRequest(frameNumber) {
    const parsedFrameNumber = Number.parseInt(frameNumber);
    return this.packetRepository.getByFrameNumber(parsedFrameNumber);
  }

  /**
   * Clear all requests
   * @returns {Object} Result with clearedTables array
   */
  clearRequests() {
    return this.packetRepository.clearAll();
  }

  /**
   * Get requests for export (no limit)
   * @param {RequestFilters} filters - Typed filter model
   * @returns {Array} Array of packet objects
   */
  getRequestsForExport(filters) {
    const exportFilters = new RequestFilters({
      ...filters,
      limit: Defaults.EXPORT_LIMIT,
      offset: Defaults.DEFAULT_OFFSET,
    });
    const repoFilters = exportFilters.toRepositoryFilters();
    return this.packetRepository.queryRequests(repoFilters);
  }
}
