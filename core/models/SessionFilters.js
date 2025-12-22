/**
 * Session filters model
 */
import { Defaults } from '../constants/Defaults.js';

export class SessionFilters {
  constructor(data = {}) {
    this.startTime = data.startTime !== undefined ? data.startTime : null;
    this.endTime = data.endTime !== undefined ? data.endTime : null;
    this.limit = data.limit !== undefined ? Number.parseInt(data.limit) : Defaults.DEFAULT_LIMIT;
    this.offset =
      data.offset !== undefined ? Number.parseInt(data.offset) : Defaults.DEFAULT_OFFSET;
  }

  toRepositoryFilters() {
    return {
      startTime: this.startTime ? BigInt(this.startTime) : null,
      endTime: this.endTime ? BigInt(this.endTime) : null,
      limit: this.limit,
      offset: this.offset,
    };
  }
}
