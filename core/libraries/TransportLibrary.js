import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { WebSocketClientTransport } from '@modelcontextprotocol/sdk/client/websocket.js';

import { Environment } from '#core/configs/environment.js';

/**
 * Library for MCP transport creation utilities
 * Pure utility - no dependencies on services or repositories
 */

/**
 * Create transport for MCP server based on config
 * @param {Object} serverConfig - Server configuration
 * @param {string} [serverConfig.type] - Transport type (stdio, http, websocket)
 * @param {string} [serverConfig.url] - Server URL (for http/websocket)
 * @param {Object} [serverConfig.headers] - HTTP headers
 * @param {string} [serverConfig.command] - Command for stdio transport
 * @param {Array} [serverConfig.args] - Command arguments
 * @param {Object} [serverConfig.env] - Environment variables
 * @param {string} [serverName] - Server name for error messages
 * @returns {Object} Transport instance
 * @throws {Error} If transport cannot be created
 */
export function createTransport(serverConfig, serverName = null) {
  const type = serverConfig.type || (serverConfig.url ? 'http' : 'stdio');
  const {
    url,
    headers: configHeaders = {},
    command,
    args = [],
    env: configEnv = {},
  } = serverConfig;

  const env = {
    ...Environment.getEnv(),
    ...configEnv,
  };

  const requestInit = { headers: { ...configHeaders } };

  const errorPrefix = serverName ? `Server ${serverName}: ` : '';

  switch (type) {
    case 'stdio':
      if (!command) {
        throw new Error(`${errorPrefix}command is required for stdio transport`);
      }
      return new StdioClientTransport({ command, args, env });

    case 'http':
    case 'sse':
    case 'streamable-http':
      if (!url) {
        throw new Error(`${errorPrefix}url is required for ${type} transport`);
      }
      return new StreamableHTTPClientTransport(new URL(url), { requestInit });

    case 'ws':
    case 'websocket':
      if (!url) {
        throw new Error(`${errorPrefix}url is required for websocket transport`);
      }
      return new WebSocketClientTransport(new URL(url));

    default:
      if (command) {
        return new StdioClientTransport({ command, args, env });
      }
      throw new Error(`${errorPrefix}unsupported transport type: ${type}`);
  }
}
