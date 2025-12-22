/**
 * Library for serialization utilities
 * Pure utility functions - no dependencies on services or repositories
 */
export class SerializationLibrary {
  /**
   * Serialize BigInt values to strings for JSON compatibility
   */
  serializeBigInt(data) {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === 'bigint') {
      return data.toString();
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.serializeBigInt(item));
    }

    if (typeof data === 'object') {
      const serialized = {};
      for (const [key, value] of Object.entries(data)) {
        serialized[key] = this.serializeBigInt(value);
      }
      return serialized;
    }

    return data;
  }
}
