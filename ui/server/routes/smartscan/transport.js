import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { WebSocketClientTransport } from '@modelcontextprotocol/sdk/client/websocket.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

/**
 * Create transport for MCP server based on config
 */
export function createTransport(serverConfig, serverName) {
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
