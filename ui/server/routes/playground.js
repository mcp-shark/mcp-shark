import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const MCP_SERVER_URL = 'http://localhost:9851/mcp';

// Store client connections per session
const clientSessions = new Map();

export function createPlaygroundRoutes() {
  const router = {};

  // Get or create client for a session
  async function getClient(sessionId) {
    if (clientSessions.has(sessionId)) {
      return clientSessions.get(sessionId);
    }

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

    const transport = new StreamableHTTPClientTransport(new URL(MCP_SERVER_URL));
    await client.connect(transport);

    const clientWrapper = {
      client,
      transport,
      close: async () => {
        await client.close();
        transport.close?.();
      },
    };

    clientSessions.set(sessionId, clientWrapper);
    return clientWrapper;
  }

  router.proxyRequest = async (req, res) => {
    try {
      const { method, params } = req.body;

      if (!method) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'method field is required',
        });
      }

      // Get or create session ID
      const sessionId =
        req.headers['mcp-session-id'] ||
        req.headers['x-mcp-session-id'] ||
        `playground-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const { client } = await getClient(sessionId);

      let result;
      switch (method) {
        case 'tools/list':
          result = await client.listTools();
          break;
        case 'tools/call':
          if (!params?.name) {
            return res.status(400).json({
              error: 'Invalid request',
              message: 'Tool name is required',
            });
          }
          result = await client.callTool({
            name: params.name,
            arguments: params.arguments || {},
          });
          break;
        case 'prompts/list':
          result = await client.listPrompts();
          break;
        case 'prompts/get':
          if (!params?.name) {
            return res.status(400).json({
              error: 'Invalid request',
              message: 'Prompt name is required',
            });
          }
          result = await client.getPrompt({
            name: params.name,
            arguments: params.arguments || {},
          });
          break;
        case 'resources/list':
          result = await client.listResources();
          break;
        case 'resources/read':
          if (!params?.uri) {
            return res.status(400).json({
              error: 'Invalid request',
              message: 'Resource URI is required',
            });
          }
          result = await client.readResource({ uri: params.uri });
          break;
        default:
          return res.status(400).json({
            error: 'Unsupported method',
            message: `Method ${method} is not supported`,
          });
      }

      // Return session ID in response
      res.setHeader('Mcp-Session-Id', sessionId);
      res.json({
        result,
        _sessionId: sessionId,
      });
    } catch (error) {
      console.error('Error in playground proxy:', error);

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
    if (sessionId && clientSessions.has(sessionId)) {
      const clientWrapper = clientSessions.get(sessionId);
      await clientWrapper.close();
      clientSessions.delete(sessionId);
    }
    res.json({ success: true });
  };

  return router;
}
