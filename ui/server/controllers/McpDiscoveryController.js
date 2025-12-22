import { HttpStatus } from '#core/constants';

/**
 * Controller for MCP discovery HTTP endpoints
 */
export class McpDiscoveryController {
  constructor(mcpDiscoveryService, logger) {
    this.mcpDiscoveryService = mcpDiscoveryService;
    this.logger = logger;
  }

  discoverServers = async (_req, res) => {
    try {
      const result = await this.mcpDiscoveryService.discoverAllServers();

      if (!result.success) {
        if (result.error === 'MCP config file not found') {
          return res.status(HttpStatus.NOT_FOUND).json({
            error: 'MCP config file not found',
            message: 'Config file not found',
          });
        }
        if (result.error === 'No servers found in config') {
          return res.status(HttpStatus.BAD_REQUEST).json({
            error: 'No servers found in config',
            message: 'The config file does not contain any MCP servers',
          });
        }
      }

      return res.json({
        success: true,
        servers: result.servers,
      });
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Error discovering servers');
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to discover servers',
        message: error.message,
      });
    }
  };
}
