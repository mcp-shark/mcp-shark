import { NotFoundError, ValidationError } from '#core/libraries/index.js';
import { handleError } from '../utils/errorHandler.js';

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
          return handleError(
            new NotFoundError('Config file not found', null),
            res,
            this.logger,
            'Error discovering servers'
          );
        }
        if (result.error === 'No servers found in config') {
          return handleError(
            new ValidationError('The config file does not contain any MCP servers', null),
            res,
            this.logger,
            'Error discovering servers'
          );
        }
      }

      return res.json({
        success: true,
        servers: result.servers,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error discovering servers');
    }
  };
}
