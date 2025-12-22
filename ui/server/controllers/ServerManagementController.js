import { StatusCodes } from '#core/constants/index.js';
import { handleError, handleValidationError } from '../utils/errorHandler.js';

/**
 * Controller for server management HTTP endpoints
 */
export class ServerManagementController {
  constructor(serverManagementService, logService, logger) {
    this.serverManagementService = serverManagementService;
    this.logService = logService;
    this.logger = logger;
  }

  /**
   * Add log entry
   */
  _addLogEntry(type, message) {
    const timestamp = new Date().toISOString();
    const log = { timestamp, type, line: message };
    this.logService.addLog(log);
  }

  setup = async (req, res) => {
    try {
      this.logger?.debug({ body: req.body }, 'Setup request received');
      const { filePath, fileContent, selectedServices } = req.body;

      if (!filePath && !fileContent) {
        return handleValidationError(
          'Either filePath or fileContent is required',
          res,
          this.logger
        );
      }

      const setupResult = await this.serverManagementService.setup({
        filePath,
        fileContent,
        selectedServices,
        port: 9851,
        onError: (err) => {
          this._addLogEntry('error', `Failed to start mcp-shark server: ${err.message}`);
          throw err;
        },
        onReady: () => {
          this._addLogEntry('info', 'MCP Shark server is ready!');
        },
      });

      if (!setupResult.success) {
        const statusCode =
          setupResult.error === 'File not found' ? StatusCodes.NOT_FOUND : StatusCodes.BAD_REQUEST;
        return res.status(statusCode).json(setupResult);
      }

      // Add log entries for setup process
      this._addLogEntry('info', '[UI Server] Starting MCP-Shark server as library...');

      if (setupResult.warning) {
        this._addLogEntry('warn', `[WARNING] ${setupResult.warning}`);
      }

      res.json(setupResult);
    } catch (error) {
      const timestamp = new Date().toISOString();
      const errorLog = {
        timestamp,
        type: 'error',
        line: `[ERROR] Failed to setup mcp-shark server: ${error.message}`,
      };
      this.logService.addLog(errorLog);
      handleError(error, res, this.logger, 'Error setting up mcp-shark server');
    }
  };

  stop = async (_req, res) => {
    try {
      const stopped = await this.serverManagementService.stopServer();
      const restored = this.configService.restoreOriginalConfig();

      if (stopped) {
        if (restored) {
          const timestamp = new Date().toISOString();
          const restoreLog = {
            timestamp,
            type: 'stdout',
            line: '[RESTORE] Restored original config',
          };
          this.logService.addLog(restoreLog);
        }
        res.json({
          success: true,
          message: 'MCP Shark server stopped and config restored',
        });
      } else {
        res.json({ success: true, message: 'MCP Shark server was not running' });
      }
    } catch (error) {
      handleError(error, res, this.logger, 'Error stopping server');
    }
  };

  getStatus = (_req, res) => {
    try {
      const status = this.serverManagementService.getServerStatus();
      res.json(status);
    } catch (error) {
      handleError(error, res, this.logger, 'Error getting server status');
    }
  };

  /**
   * GET /api/mcp-server/status
   * Check if the MCP server (gateway) is running
   * This endpoint specifically indicates whether the MCP gateway server is active
   * so users can know if they should focus on the traffic page
   */
  getMcpServerStatus = (_req, res) => {
    try {
      const status = this.serverManagementService.getServerStatus();
      res.json({
        running: status.running,
        message: status.running
          ? 'MCP server (gateway) is running and ready to receive traffic'
          : 'MCP server (gateway) is not running. Start the server to begin capturing traffic.',
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error getting MCP server status');
    }
  };

  shutdown = async (_req, res) => {
    try {
      if (!this.cleanup) {
        return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
          error: 'ServiceUnavailableError',
          message: 'Shutdown not available',
          details: 'Cleanup function not configured',
        });
      }

      const result = await this.serverManagementService.shutdown(this.cleanup);

      res.json(result);

      // Give time for response to be sent before process exits
      setTimeout(() => {
        process.exit(0);
      }, 100);
    } catch (error) {
      handleError(error, res, this.logger, 'Error shutting down application');
    }
  };
}
