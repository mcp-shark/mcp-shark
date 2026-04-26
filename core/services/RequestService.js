import { Defaults } from '../constants/Defaults.js';
/**
 * Service for request-related business logic
 * Uses repositories for data access
 * HTTP-agnostic: accepts models, returns models
 */
import { RequestFilters } from '../models/RequestFilters.js';
import { parseAauthForPacket } from './security/aauthParser.js';

/**
 * Attach an `aauth` field to a packet record by parsing its headers_json.
 * Pure function; no DB writes. Always returns a new object.
 */
function enrichWithAauth(packet) {
  if (!packet) {
    return packet;
  }
  try {
    return { ...packet, aauth: parseAauthForPacket(packet) };
  } catch {
    return packet;
  }
}

/**
 * Filter a list of packets according to AAuth-derived filters that are not
 * supported by the repository (which only knows about DB columns).
 */
function applyAauthFilters(packets, filters) {
  if (!filters) {
    return packets;
  }
  const { aauthPosture = null, aauthAgent = null, aauthMission = null } = filters;
  if (!aauthPosture && !aauthAgent && !aauthMission) {
    return packets;
  }

  return packets.filter((p) => {
    const aauth = p?.aauth;
    if (!aauth) {
      return false;
    }
    if (aauthPosture && aauth.posture !== aauthPosture) {
      return false;
    }
    if (aauthAgent && aauth.agent !== aauthAgent) {
      return false;
    }
    if (aauthMission && aauth.mission !== aauthMission) {
      return false;
    }
    return true;
  });
}

export class RequestService {
  constructor(packetRepository) {
    this.packetRepository = packetRepository;
  }

  /**
   * Get requests with filters
   * @param {RequestFilters} filters - Typed filter model
   * @returns {Array} Array of packet objects, each enriched with an `aauth` block.
   */
  getRequests(filters) {
    const repoFilters = filters.toRepositoryFilters();
    const rows = this.packetRepository.queryRequests(repoFilters);
    const enriched = rows.map(enrichWithAauth);
    return applyAauthFilters(enriched, {
      aauthPosture: filters.aauthPosture,
      aauthAgent: filters.aauthAgent,
      aauthMission: filters.aauthMission,
    });
  }

  /**
   * Get request by frame number
   * @param {number} frameNumber - Frame number
   * @returns {Object|null} Packet object enriched with an `aauth` block, or null.
   */
  getRequest(frameNumber) {
    const parsedFrameNumber = Number.parseInt(frameNumber);
    return enrichWithAauth(this.packetRepository.getByFrameNumber(parsedFrameNumber));
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
    return this.packetRepository.queryRequests(repoFilters).map(enrichWithAauth);
  }
}
