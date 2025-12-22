import { McpClientController } from '#ui/server/controllers';

/**
 * Create playground routes
 * Routes delegate to McpClientController which calls McpClientService
 */
export function createPlaygroundRoutes(container) {
  const mcpClientService = container.getService('mcpClient');
  const logger = container.getLibrary('logger');
  const mcpClientController = new McpClientController(mcpClientService, logger);

  const router = {};

  router.proxyRequest = mcpClientController.proxyRequest;
  router.cleanup = mcpClientController.cleanup;

  return router;
}
