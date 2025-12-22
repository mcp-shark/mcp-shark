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
      const { filePath, fileContent, selectedServices } = req.body;

      if (!filePath && !fileContent) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Either filePath or fileContent is required',
        });
      }

      const fileData = this.configService.resolveFileData(filePath, fileContent);

      if (!fileData) {
        const resolvedFilePath = filePath ? this.configService.resolveFilePath(filePath) : null;
        return res.status(HttpStatus.NOT_FOUND).json({
          error: 'File not found',
          path: resolvedFilePath,
        });
      }

      const parseResult = this.configService.parseJsonConfig(fileData.content);

      if (!parseResult.config) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Invalid JSON file',
          details: parseResult.error ? parseResult.error.message : 'Failed to parse JSON',
        });
      }

      const originalConfig = parseResult.config;
      const baseConvertedConfig = this.configService.convertMcpServersToServers(originalConfig);

      const convertedConfig =
        selectedServices && Array.isArray(selectedServices) && selectedServices.length > 0
          ? this.configService.filterServers(baseConvertedConfig, selectedServices)
          : baseConvertedConfig;

      if (Object.keys(convertedConfig.servers).length === 0) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: 'No servers found in config' });
      }

      const mcpsJsonPath = this.configService.getMcpConfigPath();
      this.configService.writeConfigFile(mcpsJsonPath, JSON.stringify(convertedConfig, null, 2));

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

      this.configService.getSelectedServiceNames(originalConfig, selectedServices);
      const updatedConfig = this.configService.updateConfigForMcpShark(originalConfig);
      const backupPath = null; // TODO: Implement backup creation in BackupService

      if (fileData.resolvedFilePath && this.configService.fileExists(fileData.resolvedFilePath)) {
        this.configService.writeConfigFile(
          fileData.resolvedFilePath,
          JSON.stringify(updatedConfig, null, 2)
        );
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
}
