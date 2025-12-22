/**
 * Service for conversation-related business logic
 * HTTP-agnostic: accepts models, returns models
 */
export class ConversationService {
  constructor(conversationRepository) {
    this.conversationRepository = conversationRepository;
  }

  /**
   * Get conversations with filters
   * @param {ConversationFilters} filters - Typed filter model
   * @returns {Array} Array of conversation objects (raw from repository)
   */
  getConversations(filters) {
    const repoFilters = filters.toRepositoryFilters();
    return this.conversationRepository.queryConversations(repoFilters);
  }
}
