import { ConversationController } from '../controllers/ConversationController.js';

export function createConversationsRoutes(container) {
  const conversationService = container.getService('conversation');
  const serializationLib = container.getLibrary('serialization');
  const logger = container.getLibrary('logger');

  const controller = new ConversationController(conversationService, serializationLib, logger);

  const router = {};

  router.getConversations = (req, res) => controller.getConversations(req, res);

  return router;
}
