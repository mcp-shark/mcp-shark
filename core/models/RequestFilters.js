/**
 * Request filters model
 * Used for filtering packet/request queries
 */
import { Defaults } from '../constants/Defaults.js';

export class RequestFilters {
  constructor(data = {}) {
    this.sessionId = data.sessionId || null;
    this.direction = data.direction || null;
    this.method = data.method || null;
    this.jsonrpcMethod = data.jsonrpcMethod || null;
    this.statusCode = data.statusCode !== undefined ? data.statusCode : null;
    this.jsonrpcId = data.jsonrpcId || null;
    this.search = data.search || null;
    this.serverName = data.serverName || null;
    this.startTime = data.startTime !== undefined ? data.startTime : null;
    this.endTime = data.endTime !== undefined ? data.endTime : null;
    this.limit = data.limit !== undefined ? Number.parseInt(data.limit) : Defaults.DEFAULT_LIMIT;
    this.offset =
      data.offset !== undefined ? Number.parseInt(data.offset) : Defaults.DEFAULT_OFFSET;
  }

  /**
   * Convert to repository filter format
   */
  toRepositoryFilters() {
    return {
      sessionId: this.sessionId,
      direction: this.direction,
      method: this.method,
      jsonrpcMethod: this.jsonrpcMethod,
      statusCode: this.statusCode,
      jsonrpcId: this.jsonrpcId,
      search: this.search,
      serverName: this.serverName,
      startTime: this.startTime ? BigInt(this.startTime) : null,
      endTime: this.endTime ? BigInt(this.endTime) : null,
      limit: this.limit,
      offset: this.offset,
    };
  }
}
