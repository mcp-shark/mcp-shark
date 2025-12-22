import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { Server as ServerConstants } from '#core/constants/Server.js';
import { ValidationError } from '#core/libraries/index.js';

/**
 * Service for MCP client management (Playground)
 * Handles client connections and method execution
 */
export class McpClientService {
  constructor(logger) {
    this.logger = logger;
    this.clientSessions = new Map();
    this.mcpServerBaseUrl = 'http://localhost:9851/mcp';
    this.cleanupIntervalId = null;
    this.startCleanupJob();
  }

  /**
   * Get session key
   */
  getSessionKey(serverName, sessionId) {
    return `${serverName}:${sessionId}`;
  }

  /**
   * Get or create client for a session and server
   */
  async getOrCreateClient(serverName, sessionId) {
    const sessionKey = this.getSessionKey(serverName, sessionId);
    if (this.clientSessions.has(sessionKey)) {
      return this.clientSessions.get(sessionKey);
    }

    if (!serverName) {
      throw new ValidationError('Server name is required');
    }

    const mcpServerUrl = `${this.mcpServerBaseUrl}/${encodeURIComponent(serverName)}`;

    const client = new Client(
      { name: 'mcp-shark-playground', version: '1.0.0' },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    );

    const transport = new StreamableHTTPClientTransport(new URL(mcpServerUrl));
    await client.connect(transport);

    const clientWrapper = {
      client,
      transport,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      close: async () => {
        await client.close();
        transport.close?.();
      },
    };

    this.clientSessions.set(sessionKey, clientWrapper);
    return clientWrapper;
  }

  /**
   * Update last accessed time for a session
   */
  updateLastAccessed(serverName, sessionId) {
    const sessionKey = this.getSessionKey(serverName, sessionId);
    const clientWrapper = this.clientSessions.get(sessionKey);
    if (clientWrapper) {
      clientWrapper.lastAccessed = Date.now();
    }
  }

  /**
   * Execute MCP method
   */
  async executeMethod(client, method, params) {
    switch (method) {
      case 'tools/list':
        return await client.listTools();
      case 'tools/call':
        if (!params?.name) {
          throw new ValidationError('Tool name is required');
        }
        return await client.callTool({
          name: params.name,
          arguments: params.arguments || {},
        });
      case 'prompts/list':
        return await client.listPrompts();
      case 'prompts/get':
        if (!params?.name) {
          throw new ValidationError('Prompt name is required');
        }
        return await client.getPrompt({
          name: params.name,
          arguments: params.arguments || {},
        });
      case 'resources/list':
        return await client.listResources();
      case 'resources/read':
        if (!params?.uri) {
          throw new ValidationError('Resource URI is required');
        }
        return await client.readResource({ uri: params.uri });
      default:
        throw new ValidationError(`Unsupported method: ${method}`);
    }
  }

  /**
   * Close client connection
   */
  async closeClient(serverName, sessionId) {
    const sessionKey = this.getSessionKey(serverName, sessionId);
    if (this.clientSessions.has(sessionKey)) {
      const clientWrapper = this.clientSessions.get(sessionKey);
      await clientWrapper.close();
      this.clientSessions.delete(sessionKey);
      return true;
    }
    return false;
  }

  /**
   * Cleanup session (close all clients for a session)
   */
  async cleanupSession(sessionId) {
    const keysToDelete = [];
    for (const [key, clientWrapper] of this.clientSessions.entries()) {
      if (key.endsWith(`:${sessionId}`)) {
        await clientWrapper.close();
        keysToDelete.push(key);
      }
    }
    for (const key of keysToDelete) {
      this.clientSessions.delete(key);
    }
    return keysToDelete.length;
  }

  /**
   * Cleanup stale client sessions based on timeout
   */
  async cleanupStaleSessions() {
    const now = Date.now();
    const staleThreshold = now - ServerConstants.MCP_CLIENT_SESSION_TIMEOUT_MS;
    const keysToDelete = [];

    for (const [key, clientWrapper] of this.clientSessions.entries()) {
      if (clientWrapper.lastAccessed < staleThreshold) {
        try {
          await clientWrapper.close();
          keysToDelete.push(key);
        } catch (error) {
          this.logger?.error(
            { error: error.message, sessionKey: key },
            'Error closing stale MCP client session'
          );
        }
      }
    }

    for (const key of keysToDelete) {
      this.clientSessions.delete(key);
    }

    if (keysToDelete.length > 0) {
      this.logger?.info({ count: keysToDelete.length }, 'Cleaned up stale MCP client sessions');
    }

    return keysToDelete.length;
  }

  /**
   * Start periodic cleanup job for stale sessions
   */
  startCleanupJob() {
    if (this.cleanupIntervalId) {
      return;
    }

    // Run cleanup every 5 minutes
    this.cleanupIntervalId = setInterval(
      () => {
        this.cleanupStaleSessions().catch((error) => {
          this.logger?.error({ error: error.message }, 'Error in MCP client session cleanup job');
        });
      },
      5 * 60 * 1000
    );
  }

  /**
   * Stop cleanup job
   */
  stopCleanupJob() {
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
      this.cleanupIntervalId = null;
    }
  }

  /**
   * Cleanup all client sessions (for shutdown)
   */
  async cleanupAll() {
    this.stopCleanupJob();
    const keysToDelete = Array.from(this.clientSessions.keys());

    for (const key of keysToDelete) {
      try {
        const clientWrapper = this.clientSessions.get(key);
        if (clientWrapper) {
          await clientWrapper.close();
        }
      } catch (error) {
        this.logger?.error(
          { error: error.message, sessionKey: key },
          'Error closing MCP client session during cleanup'
        );
      }
      this.clientSessions.delete(key);
    }

    return keysToDelete.length;
  }
}
