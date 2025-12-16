import { existsSync, readFileSync } from 'node:fs';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { getMcpConfigPath } from 'mcp-shark-common/configs/index.js';
import { convertMcpServersToServers } from '../../utils/config.js';
import { createTransport } from './transport.js';

/**
 * Discover a single MCP server
 */
async function discoverServer(serverName, serverConfig) {
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
    const prompts = promptsResult.status === 'fulfilled' ? promptsResult.value?.prompts || [] : [];

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
 * GET /api/smartscan/discover
 */
export async function discoverServers(_req, res) {
  try {
    const configPath = getMcpConfigPath();

    if (!existsSync(configPath)) {
      return res.status(404).json({
        error: 'MCP config file not found',
        message: `Config file not found at: ${configPath}`,
      });
    }

    const configContent = readFileSync(configPath, 'utf-8');
    const parsedConfig = JSON.parse(configContent);

    const convertedConfig = convertMcpServersToServers(parsedConfig);
    const servers = convertedConfig.servers || {};

    if (Object.keys(servers).length === 0) {
      return res.status(400).json({
        error: 'No servers found in config',
        message: 'The config file does not contain any MCP servers',
      });
    }

    const discoveryPromises = Object.entries(servers).map(async ([serverName, serverConfig]) => {
      try {
        return await discoverServer(serverName, serverConfig);
      } catch (error) {
        console.error(`Error discovering server ${serverName}:`, error);
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

    return res.json({
      success: true,
      servers: discoveredServers,
    });
  } catch (error) {
    console.error('Error discovering servers:', error);
    return res.status(500).json({
      error: 'Failed to discover servers',
      message: error.message,
    });
  }
}
