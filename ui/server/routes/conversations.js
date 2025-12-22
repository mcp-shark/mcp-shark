export function createConversationsRoutes(container) {
  const conversationService = container.getService('conversation');
  const logger = container.getLibrary('logger');

  const router = {};

  router.getConversations = (req, res) => {
    try {
      const conversations = conversationService.getConversations(req.query);
      res.json(conversations);
    } catch (error) {
      logger.error({ error: error.message }, 'Error in getConversations');
      res.status(500).json({ error: 'Failed to query conversations', details: error.message });
    }
  };

  return router;
}
