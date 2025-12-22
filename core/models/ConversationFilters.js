/**
 * Conversation filters model
 */
import { Defaults } from '../constants/Defaults.js';

export class ConversationFilters {
  constructor(data = {}) {
    this.sessionId = data.sessionId || null;
    this.method = data.method || null;
    this.status = data.status || null;
    this.jsonrpcId = data.jsonrpcId || null;
    this.startTime = data.startTime !== undefined ? data.startTime : null;
    this.endTime = data.endTime !== undefined ? data.endTime : null;
    this.limit = data.limit !== undefined ? Number.parseInt(data.limit) : Defaults.DEFAULT_LIMIT;
    this.offset =
      data.offset !== undefined ? Number.parseInt(data.offset) : Defaults.DEFAULT_OFFSET;
  }

  toRepositoryFilters() {
    return {
      sessionId: this.sessionId,
      method: this.method,
      status: this.status,
      jsonrpcId: this.jsonrpcId,
      startTime: this.startTime ? BigInt(this.startTime) : null,
      endTime: this.endTime ? BigInt(this.endTime) : null,
      limit: this.limit,
      offset: this.offset,
    };
  }
}
