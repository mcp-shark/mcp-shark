import { initAuditLogger, startMcpSharkServer } from '#core/mcp-server/index.js';

/**
 * Service for managing MCP Shark server lifecycle
 * Handles server startup, shutdown, and status
 */
export class ServerManagementService {
  constructor(configService, logger) {
    this.configService = configService;
    this.logger = logger;
    this.serverInstance = null;
  }

  /**
   * Start MCP Shark server
   */
  async startServer(options = {}) {
    const { configPath, port = 9851, onError, onReady } = options;

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
