import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

/**
 * Service for MCP client management (Playground)
 * Handles client connections and method execution
 */
export class McpClientService {
  constructor(logger) {
    this.logger = logger;
    this.clientSessions = new Map();
    this.mcpServerBaseUrl = 'http://localhost:9851/mcp';
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
      throw new Error('Server name is required');
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
      close: async () => {
        await client.close();
        transport.close?.();
      },
    };

    this.clientSessions.set(sessionKey, clientWrapper);
    return clientWrapper;
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
          throw new Error('Tool name is required');
        }
        return await client.callTool({
          name: params.name,
          arguments: params.arguments || {},
        });
      case 'prompts/list':
        return await client.listPrompts();
      case 'prompts/get':
        if (!params?.name) {
          throw new Error('Prompt name is required');
        }
        return await client.getPrompt({
          name: params.name,
          arguments: params.arguments || {},
        });
      case 'resources/list':
        return await client.listResources();
      case 'resources/read':
        if (!params?.uri) {
          throw new Error('Resource URI is required');
        }
        return await client.readResource({ uri: params.uri });
      default:
        throw new Error(`Unsupported method: ${method}`);
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
    keysToDelete.forEach((key) => this.clientSessions.delete(key));
    return keysToDelete.length;
  }
}
