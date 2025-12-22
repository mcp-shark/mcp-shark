import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { createTransport } from '#ui/server/routes/smartscan/transport.js';

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
    const transport = createTransport(serverConfig, serverName);
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
}
