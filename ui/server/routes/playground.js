import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import logger from '../utils/logger.js';

const MCP_SERVER_BASE_URL = 'http://localhost:9851/mcp';

// Store client connections per server and session
const clientSessions = new Map();

function getSessionKey(serverName, sessionId) {
  return `${serverName}:${sessionId}`;
}

export function createPlaygroundRoutes() {
  const router = {};

  // Get or create client for a session and server
  async function getClient(serverName, sessionId) {
    const sessionKey = getSessionKey(serverName, sessionId);
    if (clientSessions.has(sessionKey)) {
      return clientSessions.get(sessionKey);
    }

    if (!serverName) {
      throw new Error('Server name is required');
    }

    const mcpServerUrl = `${MCP_SERVER_BASE_URL}/${encodeURIComponent(serverName)}`;

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

    clientSessions.set(sessionKey, clientWrapper);
    return clientWrapper;
  }

  router.proxyRequest = async (req, res) => {
    try {
      const { method, params, serverName } = req.body;

      if (!method) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'method field is required',
        });
      }

      if (!serverName) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'serverName field is required',
        });
      }

      // Get or create session ID
      const sessionId =
        req.headers['mcp-session-id'] ||
        req.headers['x-mcp-session-id'] ||
        `playground-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const { client } = await getClient(serverName, sessionId);

      const executeMethod = async () => {
        switch (method) {
          case 'tools/list':
            return await client.listTools();
          case 'tools/call':
            if (!params?.name) {
              return res.status(400).json({
                error: 'Invalid request',
                message: 'Tool name is required',
              });
            }
            return await client.callTool({
              name: params.name,
              arguments: params.arguments || {},
            });
          case 'prompts/list':
            return await client.listPrompts();
          case 'prompts/get':
            if (!params?.name) {
              return res.status(400).json({
                error: 'Invalid request',
                message: 'Prompt name is required',
              });
            }
            return await client.getPrompt({
              name: params.name,
              arguments: params.arguments || {},
            });
          case 'resources/list':
            return await client.listResources();
          case 'resources/read':
            if (!params?.uri) {
              return res.status(400).json({
                error: 'Invalid request',
                message: 'Resource URI is required',
              });
            }
            return await client.readResource({ uri: params.uri });
          default:
            return res.status(400).json({
              error: 'Unsupported method',
              message: `Method ${method} is not supported`,
            });
        }
      };

      const result = await executeMethod();

      // Return session ID in response
      res.setHeader('Mcp-Session-Id', sessionId);
      res.json({
        result,
        _sessionId: sessionId,
      });
    } catch (error) {
      logger.error({ error: error.message }, 'Error in playground proxy');

      // Check if it's a connection error
      if (error.message?.includes('ECONNREFUSED') || error.message?.includes('connect')) {
        return res.status(503).json({
          error: 'MCP server unavailable',
          message: error.message,
          details: 'Make sure the MCP Shark server is running on port 9851',
        });
      }

      res.status(500).json({
        error: 'Internal server error',
        message: error.message || 'Unknown error',
      });
    }
  };

  // Cleanup endpoint to close client connections
  router.cleanup = async (req, res) => {
    const sessionId = req.headers['mcp-session-id'] || req.headers['x-mcp-session-id'];
    const { serverName } = req.body || {};

    if (serverName && sessionId) {
      const sessionKey = getSessionKey(serverName, sessionId);
      if (clientSessions.has(sessionKey)) {
        const clientWrapper = clientSessions.get(sessionKey);
        await clientWrapper.close();
        clientSessions.delete(sessionKey);
      }
    } else if (sessionId) {
      // Cleanup all sessions for this sessionId across all servers
      for (const [key, clientWrapper] of clientSessions.entries()) {
        if (key.endsWith(`:${sessionId}`)) {
          await clientWrapper.close();
          clientSessions.delete(key);
        }
      }
    }
    res.json({ success: true });
  };

  return router;
}
