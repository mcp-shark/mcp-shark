import { handleError, handleValidationError } from '../utils/errorHandler.js';

/**
 * Controller for MCP client (Playground) HTTP endpoints
 */
export class McpClientController {
  constructor(mcpClientService, logger) {
    this.mcpClientService = mcpClientService;
    this.logger = logger;
  }

  proxyRequest = async (req, res) => {
    try {
      const { method, params, serverName } = req.body;

      if (!method) {
        return handleValidationError('method field is required', res, this.logger);
      }

      if (!serverName) {
        return handleValidationError('serverName field is required', res, this.logger);
      }

      const sessionId =
        req.headers['mcp-session-id'] ||
        req.headers['x-mcp-session-id'] ||
        `playground-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const { client } = await this.mcpClientService.getOrCreateClient(serverName, sessionId);
      this.mcpClientService.updateLastAccessed(serverName, sessionId);

      const result = await this.mcpClientService.executeMethod(client, method, params);

      res.setHeader('Mcp-Session-Id', sessionId);
      res.json({
        result,
        _sessionId: sessionId,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error in playground proxy');
    }
  };

  cleanup = async (req, res) => {
    try {
      const sessionId = req.headers['mcp-session-id'] || req.headers['x-mcp-session-id'];
      const { serverName } = req.body || {};

      if (serverName && sessionId) {
        await this.mcpClientService.closeClient(serverName, sessionId);
      } else if (sessionId) {
        await this.mcpClientService.cleanupSession(sessionId);
      }

      res.json({ success: true });
    } catch (error) {
      handleError(error, res, this.logger, 'Error cleaning up client');
    }
  };
}
