import { HttpStatus } from '#core/constants';

/**
 * Controller for MCP client (Playground) HTTP endpoints
 */
export class McpClientController {
  constructor(mcpClientService, logger) {
    this.mcpClientService = mcpClientService;
    this.logger = logger;
  }

  /**
   * Execute MCP method with error handling
   */
  async _executeMethodWithErrorHandling(client, method, params, res) {
    try {
      return await this.mcpClientService.executeMethod(client, method, params);
    } catch (error) {
      if (error.message.includes('required')) {
        res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Invalid request',
          message: error.message,
        });
        return null;
      }
      if (error.message.includes('Unsupported method')) {
        res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Unsupported method',
          message: error.message,
        });
        return null;
      }
      throw error;
    }
  }

  proxyRequest = async (req, res) => {
    try {
      const { method, params, serverName } = req.body;

      if (!method) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Invalid request',
          message: 'method field is required',
        });
      }

      if (!serverName) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Invalid request',
          message: 'serverName field is required',
        });
      }

      const sessionId =
        req.headers['mcp-session-id'] ||
        req.headers['x-mcp-session-id'] ||
        `playground-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const { client } = await this.mcpClientService.getOrCreateClient(serverName, sessionId);

      const result = await this._executeMethodWithErrorHandling(client, method, params, res);
      if (result === null) {
        return;
      }

      res.setHeader('Mcp-Session-Id', sessionId);
      res.json({
        result,
        _sessionId: sessionId,
      });
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Error in playground proxy');

      if (error.message?.includes('ECONNREFUSED') || error.message?.includes('connect')) {
        return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
          error: 'MCP server unavailable',
          message: error.message,
          details: 'Make sure the MCP Shark server is running on port 9851',
        });
      }

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Internal server error',
        message: error.message || 'Unknown error',
      });
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
      this.logger?.error({ error: error.message }, 'Error cleaning up client');
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to cleanup client',
        details: error.message,
      });
    }
  };
}
