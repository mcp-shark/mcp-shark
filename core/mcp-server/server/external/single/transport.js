import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { WebSocketClientTransport } from '@modelcontextprotocol/sdk/client/websocket.js';

import { Environment } from '#core/configs/environment.js';
import { CompositeError } from '#core/libraries/ErrorLibrary.js';
export class TransportError extends CompositeError {
  constructor(message, error) {
    super('TransportError', message, error);
  }
}

export function makeTransport({
  type,
  url,
  headers: configHeaders = {},
  command,
  args = [],
  env: configEnv = {},
}) {
  // Start with enhanced PATH
  const env = {
    ...Environment.getEnv(),
    ...configEnv,
  };

  const requestInit = { headers: { ...configHeaders } };

  switch (type) {
    case 'stdio':
      return new StdioClientTransport({ command, args, env });
    case 'http':
    case 'sse':
    case 'streamable-http':
      return new StreamableHTTPClientTransport(new URL(url), {
        requestInit,
      });
    case 'ws':
    case 'websocket':
      return new WebSocketClientTransport(new URL(url));
    default:
      if (command) {
        // fallback: assume stdio if only command is provided
        return new StdioClientTransport({
          command,
          args,
          env,
        });
      }
      return new TransportError(
        'Unsupported server config',
        new Error(
          `Unsupported server config: ${JSON.stringify({ type, url, configHeaders, command, args })}`
        )
      );
  }
}
