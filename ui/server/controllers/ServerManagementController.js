import { StatusCodes } from '#core/constants/index.js';
import { handleError } from '../utils/errorHandler.js';

/**
 * Controller for server management HTTP endpoints
 */
export class ServerManagementController {
  constructor(serverManagementService, configService, logService, backupService, logger) {
    this.serverManagementService = serverManagementService;
    this.configService = configService;
    this.logService = logService;
    this.backupService = backupService;
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
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Either filePath or fileContent is required',
        });
      }

      const setupResult = this.configService.processSetup(filePath, fileContent, selectedServices);

      if (!setupResult.success) {
        const statusCode =
          setupResult.error === 'File not found' ? StatusCodes.NOT_FOUND : StatusCodes.BAD_REQUEST;
        return res.status(statusCode).json(setupResult);
      }

      const { fileData, convertedConfig, updatedConfig } = setupResult;
      const mcpsJsonPath = this.configService.getMcpConfigPath();
      this.configService.writeConfigAsJson(mcpsJsonPath, convertedConfig);

      const currentServer = this.serverManagementService.getServerInstance();
      if (currentServer?.stop) {
        await this.serverManagementService.stopServer();
      }

      this._addLogEntry('info', '[UI Server] Starting MCP-Shark server as library...');
      this._addLogEntry('info', `[UI Server] Config: ${mcpsJsonPath}`);

      await this.serverManagementService.startServer({
        configPath: mcpsJsonPath,
        port: 9851,
        onError: (err) => {
          this._addLogEntry('error', `Failed to start mcp-shark server: ${err.message}`);
          throw err;
        },
        onReady: () => {
          this._addLogEntry('info', 'MCP Shark server is ready!');
        },
      });

      const backupPath = null; // TODO: Implement backup creation in BackupService

      if (fileData.resolvedFilePath && this.configService.fileExists(fileData.resolvedFilePath)) {
        this.configService.writeConfigAsJson(fileData.resolvedFilePath, updatedConfig);
      }

      res.json({
        success: true,
        message: 'MCP Shark server started successfully and config file updated',
        convertedConfig,
        updatedConfig,
        filePath: fileData.resolvedFilePath || null,
        backupPath: backupPath || null,
      });
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
