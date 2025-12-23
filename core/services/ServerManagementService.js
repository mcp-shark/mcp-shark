import { Defaults } from '#core/constants/Defaults.js';
import { initAuditLogger, startMcpSharkServer } from '#core/mcp-server/index.js';

/**
 * Service for managing MCP Shark server lifecycle
 * Handles server startup, shutdown, and status
 */
export class ServerManagementService {
  constructor(configService, configPatchingService, logger) {
    this.configService = configService;
    this.configPatchingService = configPatchingService;
    this.logger = logger;
    this.serverInstance = null;
  }

  /**
   * Setup and start MCP Shark server
   * Orchestrates the entire setup process: config processing, patching, and server startup
   * @param {Object} options - Setup options
   * @param {string} [options.filePath] - Path to config file
   * @param {string} [options.fileContent] - Config file content
   * @param {Array} [options.selectedServices] - Selected services to include
   * @param {number} [options.port=Defaults.DEFAULT_MCP_SERVER_PORT] - Server port
   * @param {Function} [options.onError] - Error callback
   * @param {Function} [options.onReady] - Ready callback
   * @returns {Promise<Object>} Setup result with convertedConfig, updatedConfig, filePath
   */
  async setup(options = {}) {
    const {
      filePath,
      fileContent,
      selectedServices,
      port = Defaults.DEFAULT_MCP_SERVER_PORT,
      onError,
      onReady,
    } = options;

    if (!filePath && !fileContent) {
      return {
        success: false,
        error: 'Either filePath or fileContent is required',
      };
    }

    // If filePath is provided, restore original config if already patched
    // This ensures processSetup reads the original config, not the patched one
    const restoreWarning =
      filePath && !fileContent
        ? this.configPatchingService.restoreIfPatched(filePath).warning || null
        : null;

    // Process setup
    const setupResult = this.configService.processSetup(filePath, fileContent, selectedServices);

    if (!setupResult.success) {
      return setupResult;
    }

    const { fileData, convertedConfig, updatedConfig } = setupResult;
    const mcpsJsonPath = this.configService.getMcpConfigPath();

    // Write converted config to MCP Shark config path
    this.configService.writeConfigAsJson(mcpsJsonPath, convertedConfig);

    // Stop existing server if running
    if (this.serverInstance?.stop) {
      await this.stopServer();
    }

    // Start server
    await this.startServer({
      configPath: mcpsJsonPath,
      port,
      onError: (err) => {
        if (onError) {
          onError(err);
        }
        throw err;
      },
      onReady: () => {
        if (onReady) {
          onReady();
        }
      },
    });

    // Patch the original config file if it exists
    const patchWarning =
      fileData.resolvedFilePath && this.configService.fileExists(fileData.resolvedFilePath)
        ? this.configPatchingService.patchConfigFile(fileData.resolvedFilePath, updatedConfig)
            .warning || null
        : null;

    return {
      success: true,
      message: 'MCP Shark server started successfully and config file updated',
      convertedConfig,
      updatedConfig,
      filePath: fileData.resolvedFilePath || null,
      backupPath: null, // TODO: Implement backup creation in BackupService
      warning: restoreWarning || patchWarning || undefined,
    };
  }

  /**
   * Start MCP Shark server
   */
  async startServer(options = {}) {
    const { configPath, port = Defaults.DEFAULT_MCP_SERVER_PORT, onError, onReady } = options;

    const mcpsJsonPath = configPath || this.configService.getMcpConfigPath();

    if (this.serverInstance?.stop) {
      await this.stopServer();
    }

    this.logger?.info({ path: mcpsJsonPath }, 'Starting MCP-Shark server as library...');

    const auditLogger = initAuditLogger(this.logger);

    const serverInstance = await startMcpSharkServer({
      configPath: mcpsJsonPath,
      port,
      auditLogger,
      logger: this.logger,
      onError: (err) => {
        this.logger?.error({ error: err.message }, 'Failed to start mcp-shark server');
        this.serverInstance = null;
        if (onError) {
          onError(err);
        }
        throw err;
      },
      onReady: () => {
        this.logger?.info('MCP Shark server is ready!');
        if (onReady) {
          onReady();
        }
      },
    });

    this.serverInstance = serverInstance;
    this.logger?.info('MCP Shark server started successfully');

    return serverInstance;
  }

  /**
   * Stop MCP Shark server
   */
  async stopServer() {
    if (this.serverInstance?.stop) {
      await this.serverInstance.stop();
      this.serverInstance = null;
      this.logger?.info('MCP Shark server stopped');
      return true;
    }
    return false;
  }

  /**
   * Get server status
   */
  getServerStatus() {
    return {
      running: this.serverInstance !== null,
      pid: null, // No process PID when using library
    };
  }

  /**
   * Get current server instance
   */
  getServerInstance() {
    return this.serverInstance;
  }

  /**
   * Set server instance (for external management)
   */
  setServerInstance(instance) {
    this.serverInstance = instance;
  }

  /**
   * Shutdown the entire application
   * @param {Function} cleanup - Cleanup function to execute
   */
  async shutdown(cleanup) {
    if (!cleanup || typeof cleanup !== 'function') {
      throw new Error('Cleanup function is required');
    }

    this.logger?.info('Initiating application shutdown...');

    // Stop MCP Shark server if running
    if (this.serverInstance?.stop) {
      await this.stopServer();
    }

    // Execute cleanup
    await cleanup();

    this.logger?.info('Application shutdown complete');
    return { success: true, message: 'Application shutdown initiated' };
  }
}
