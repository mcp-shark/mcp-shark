/**
 * Smart Scan API proxy routes
 * Proxies requests to the Smart Scan API to avoid CORS issues
 */

import { getMcpConfigPath } from 'mcp-shark-common/configs/index.js';
import { readSmartScanToken, writeSmartScanToken } from '../utils/smartscan-token.js';
import { readFileSync, existsSync } from 'node:fs';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { WebSocketClientTransport } from '@modelcontextprotocol/sdk/client/websocket.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { convertMcpServersToServers } from '../utils/config.js';
import { computeMcpHash, getCachedScanResult, storeScanResult } from '../utils/scan-cache.js';

const API_BASE_URL = 'https://smart.mcpshark.sh';

export function createSmartScanRoutes() {
  const router = {};

  /**
   * Proxy POST request to create a scan
   * POST /api/smartscan/scans
   */
  router.createScan = async (req, res) => {
    try {
      const { apiToken, scanData } = req.body;

      if (!apiToken) {
        return res.status(400).json({
          error: 'API token is required',
        });
      }

      if (!scanData) {
        return res.status(400).json({
          error: 'Scan data is required',
        });
      }

      // Make request to Smart Scan API
      const response = await fetch(`${API_BASE_URL}/api/scans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify(scanData),
      });

      const data = await response.json();

      // Forward the response status and data
      return res.status(response.status).json(data);
    } catch (error) {
      console.error('Smart Scan API error:', error);
      return res.status(500).json({
        error: 'Failed to create scan',
        message: error.message,
      });
    }
  };

  /**
   * Proxy GET request to get a scan by ID
   * GET /api/smartscan/scans/:scanId
   */
  router.getScan = async (req, res) => {
    try {
      const { scanId } = req.params;
      const apiToken = req.headers.authorization?.replace('Bearer ', '');

      if (!apiToken) {
        return res.status(401).json({
          error: 'API token is required',
        });
      }

      if (!scanId) {
        return res.status(400).json({
          error: 'Scan ID is required',
        });
      }

      // Make request to Smart Scan API
      const response = await fetch(`${API_BASE_URL}/api/scans/${scanId}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${apiToken}`,
        },
      });

      const data = await response.json();

      // Forward the response status and data
      return res.status(response.status).json(data);
    } catch (error) {
      console.error('Smart Scan API error:', error);
      return res.status(500).json({
        error: 'Failed to get scan',
        message: error.message,
      });
    }
  };

  /**
   * Get stored Smart Scan token
   * GET /api/smartscan/token
   */
  router.getToken = async (req, res) => {
    try {
      const token = readSmartScanToken();
      return res.json({
        success: true,
        token: token || null,
      });
    } catch (error) {
      console.error('Error reading Smart Scan token:', error);
      return res.status(500).json({
        error: 'Failed to read token',
        message: error.message,
      });
    }
  };

  /**
   * Save Smart Scan token
   * POST /api/smartscan/token
   */
  router.saveToken = async (req, res) => {
    try {
      const { token } = req.body;

      if (token === undefined) {
        return res.status(400).json({
          error: 'Token is required',
        });
      }

      const success = writeSmartScanToken(token);

      if (!success) {
        return res.status(500).json({
          error: 'Failed to save token',
        });
      }

      return res.json({
        success: true,
        message: 'Token saved successfully',
      });
    } catch (error) {
      console.error('Error saving Smart Scan token:', error);
      return res.status(500).json({
        error: 'Failed to save token',
        message: error.message,
      });
    }
  };

  /**
   * Create transport for MCP server based on config
   */
  function createTransport(serverConfig, serverName) {
    const type = serverConfig.type || (serverConfig.url ? 'http' : 'stdio');
    const {
      url,
      headers: configHeaders = {},
      command,
      args = [],
      env: configEnv = {},
    } = serverConfig;

    // Enhanced environment
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
          // Fallback: assume stdio if only command is provided
          return new StdioClientTransport({ command, args, env });
        }
        throw new Error(`Server ${serverName}: unsupported transport type: ${type}`);
    }
  }

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

      // Discover tools, resources, and prompts
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
      } catch (closeError) {
        // Ignore close errors
      }
      throw error;
    }
  }

  /**
   * Discover all MCP servers from config
   * GET /api/smartscan/discover
   */
  router.discoverServers = async (req, res) => {
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

      // Convert config format (mcpServers -> servers)
      const convertedConfig = convertMcpServersToServers(parsedConfig);
      const servers = convertedConfig.servers || {};

      if (Object.keys(servers).length === 0) {
        return res.status(400).json({
          error: 'No servers found in config',
          message: 'The config file does not contain any MCP servers',
        });
      }

      // Discover each server
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
  };

  /**
   * Create scan for multiple servers (one request per server)
   * POST /api/smartscan/scans/batch
   */
  router.createBatchScans = async (req, res) => {
    try {
      const { apiToken, servers } = req.body;

      if (!apiToken) {
        return res.status(400).json({
          error: 'API token is required',
        });
      }

      if (!servers || !Array.isArray(servers) || servers.length === 0) {
        return res.status(400).json({
          error: 'Servers array is required',
        });
      }

      // Send one scan request per server
      const scanPromises = servers.map(async (serverData) => {
        // Compute hash of MCP server data
        const hash = computeMcpHash(serverData);

        // Check for cached result
        const cachedResult = getCachedScanResult(hash);
        if (cachedResult) {
          console.log(`Using cached scan result for server: ${serverData.name}`);
          return {
            serverName: serverData.name,
            success: true,
            status: 200,
            data: cachedResult,
            error: null,
            cached: true,
          };
        }

        // No cache hit, proceed with scan
        const scanData = {
          server: {
            name: serverData.name || 'unknown',
            description: serverData.description || null,
          },
          tools: (serverData.tools || []).map((tool) => {
            const toolData = {
              name: tool.name,
              description: tool.description || null,
            };
            if (tool.inputSchema && typeof tool.inputSchema === 'object') {
              toolData.input_schema = tool.inputSchema;
            }
            if (tool.outputSchema && typeof tool.outputSchema === 'object') {
              toolData.output_schema = tool.outputSchema;
            }
            return toolData;
          }),
          resources: (serverData.resources || []).map((resource) => ({
            uri: resource.uri,
            name: resource.name || null,
            description: resource.description || null,
            mimeType: resource.mimeType || null,
          })),
          prompts: (serverData.prompts || []).map((prompt) => ({
            name: prompt.name,
            description: prompt.description || null,
            arguments: prompt.arguments || [],
          })),
        };

        try {
          const response = await fetch(`${API_BASE_URL}/api/scans`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Bearer ${apiToken}`,
            },
            body: JSON.stringify(scanData),
          });

          const data = await response.json();

          const result = {
            serverName: serverData.name,
            success: response.ok,
            status: response.status,
            data: response.ok ? data : null,
            error: response.ok ? null : data.error || data.message || 'Unknown error',
            cached: false,
          };

          // Store successful scan results in cache
          if (response.ok && data) {
            storeScanResult(serverData.name, hash, data);
            console.log(`Stored scan result in cache for server: ${serverData.name}`);
          }

          return result;
        } catch (error) {
          return {
            serverName: serverData.name,
            success: false,
            status: 500,
            data: null,
            error: error.message,
            cached: false,
          };
        }
      });

      const results = await Promise.all(scanPromises);

      return res.json({
        success: true,
        results,
      });
    } catch (error) {
      console.error('Smart Scan batch API error:', error);
      return res.status(500).json({
        error: 'Failed to create batch scans',
        message: error.message,
      });
    }
  };

  return router;
}
