import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { WebSocketClientTransport } from '@modelcontextprotocol/sdk/client/websocket.js';

/**
 * Service for MCP server discovery
 * Handles discovering MCP servers and their capabilities
 */
export class McpDiscoveryService {
  constructor(configService, logger) {
    this.configService = configService;
    this.logger = logger;
  }

  /**
   * Discover a single MCP server
   */
  async discoverServer(serverName, serverConfig) {
    const transport = this._createTransport(serverConfig, serverName);
    const client = new Client(
      { name: 'mcp-shark-smart-scan', version: '1.0.0' },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    );

    try {
      await client.connect(transport);

      const [toolsResult, resourcesResult, promptsResult] = await Promise.allSettled([
        client.listTools(),
        client.listResources(),
        client.listPrompts(),
      ]);

      const tools = toolsResult.status === 'fulfilled' ? toolsResult.value?.tools || [] : [];
      const resources =
        resourcesResult.status === 'fulfilled' ? resourcesResult.value?.resources || [] : [];
      const prompts =
        promptsResult.status === 'fulfilled' ? promptsResult.value?.prompts || [] : [];

      await client.close();
      if (transport.close) {
        await transport.close();
      }

      return {
        name: serverName,
        tools,
        resources,
        prompts,
      };
    } catch (error) {
      try {
        await client.close();
        if (transport.close) {
          await transport.close();
        }
      } catch (_closeError) {
        // Ignore close errors
      }
      throw error;
    }
  }

  /**
   * Discover all MCP servers from config
   */
  async discoverAllServers() {
    const config = this.configService.readMcpConfig();
    if (!config) {
      return { success: false, error: 'MCP config file not found' };
    }

    const convertedConfig = this.configService.convertMcpServersToServers(config);
    const servers = convertedConfig.servers || {};

    if (Object.keys(servers).length === 0) {
      return { success: false, error: 'No servers found in config' };
    }

    const discoveryPromises = Object.entries(servers).map(async ([serverName, serverConfig]) => {
      try {
        return await this.discoverServer(serverName, serverConfig);
      } catch (error) {
        this.logger?.error({ serverName, error: error.message }, 'Error discovering server');
        return {
          name: serverName,
          tools: [],
          resources: [],
          prompts: [],
          error: error.message,
        };
      }
    });

    const discoveredServers = await Promise.all(discoveryPromises);

    return {
      success: true,
      servers: discoveredServers,
    };
  }

  _createTransport(serverConfig, serverName) {
    const type = serverConfig.type || (serverConfig.url ? 'http' : 'stdio');
    const {
      url,
      headers: configHeaders = {},
      command,
      args = [],
      env: configEnv = {},
    } = serverConfig;

    const env = {
      ...process.env,
      ...configEnv,
    };

    const requestInit = { headers: { ...configHeaders } };

    switch (type) {
      case 'stdio':
        if (!command) {
          throw new Error(`Server ${serverName}: command is required for stdio transport`);
        }
        return new StdioClientTransport({ command, args, env });

      case 'http':
      case 'sse':
      case 'streamable-http':
        if (!url) {
          throw new Error(`Server ${serverName}: url is required for ${type} transport`);
        }
        return new StreamableHTTPClientTransport(new URL(url), { requestInit });

      case 'ws':
      case 'websocket':
        if (!url) {
          throw new Error(`Server ${serverName}: url is required for websocket transport`);
        }
        return new WebSocketClientTransport(new URL(url));

      default:
        if (command) {
          return new StdioClientTransport({ command, args, env });
        }
        throw new Error(`Server ${serverName}: unsupported transport type: ${type}`);
    }
  }
}
