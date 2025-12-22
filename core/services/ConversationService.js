/**
 * Service for conversation-related business logic
 */
export class ConversationService {
  constructor(conversationRepository, serializationLib) {
    this.conversationRepository = conversationRepository;
    this.serializationLib = serializationLib;
  }

  /**
   * Get conversations with filters
   */
  getConversations(filters = {}) {
    const sanitizedFilters = {
      sessionId: filters.sessionId || null,
      method: filters.method || null,
      status: filters.status || null,
      jsonrpcId: filters.jsonrpcId || null,
      startTime: filters.startTime ? BigInt(filters.startTime) : null,
      endTime: filters.endTime ? BigInt(filters.endTime) : null,
      limit: Number.parseInt(filters.limit) || 1000,
      offset: Number.parseInt(filters.offset) || 0,
    };

    const conversations = this.conversationRepository.queryConversations(sanitizedFilters);
    return this.serializationLib.serializeBigInt(conversations);
  }
}
