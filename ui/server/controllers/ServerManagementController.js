import { HttpStatus } from '#core/constants';

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
      console.log('setup', req.body);
      const { filePath, fileContent, selectedServices } = req.body;

      if (!filePath && !fileContent) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Either filePath or fileContent is required',
        });
      }

      const setupResult = this.configService.processSetup(filePath, fileContent, selectedServices);

      if (!setupResult.success) {
        const statusCode =
          setupResult.error === 'File not found' ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
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
      this.logger?.error({ error: error.message }, 'Error setting up mcp-shark server');
      const timestamp = new Date().toISOString();
      const errorLog = {
        timestamp,
        type: 'error',
        line: `[ERROR] Failed to setup mcp-shark server: ${error.message}`,
      };
      this.logService.addLog(errorLog);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to setup mcp-shark server',
        details: error.message,
      });
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
      this.logger?.error({ error: error.message }, 'Error stopping server');
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to stop mcp-shark server',
        details: error.message,
      });
    }
  };

  getStatus = (_req, res) => {
    try {
      const status = this.serverManagementService.getServerStatus();
      res.json(status);
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Error getting server status');
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to get server status',
        details: error.message,
      });
    }
  };

  shutdown = async (_req, res) => {
    try {
      if (!this.cleanup) {
        return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
          error: 'Shutdown not available',
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
      this.logger?.error({ error: error.message }, 'Error shutting down application');
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to shutdown application',
        details: error.message,
      });
    }
  };
}
