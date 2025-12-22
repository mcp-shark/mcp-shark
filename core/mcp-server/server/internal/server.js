import { Server } from '@modelcontextprotocol/sdk/server/index.js';

import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { createPromptsGetHandler } from './handlers/prompts-get.js';
import { createPromptsListHandler } from './handlers/prompts-list.js';
import { createResourcesListHandler } from './handlers/resources-list.js';
import { createResourcesReadHandler } from './handlers/resources-read.js';
import { createToolsCallHandler } from './handlers/tools-call.js';
import { createToolsListHandler } from './handlers/tools-list.js';

export function createInternalServer(logger, mcpServers, requestedMcpServer) {
  // create MCP server
  const server = new Server(
    { name: requestedMcpServer, version: '1.0.0' },
    { capabilities: { tools: {}, prompts: {}, resources: {} } }
  );

  // Register handlers
  server.setRequestHandler(
    ListToolsRequestSchema,
    createToolsListHandler(logger, mcpServers, requestedMcpServer)
  );

  server.setRequestHandler(
    CallToolRequestSchema,
    createToolsCallHandler(logger, mcpServers, requestedMcpServer)
  );

  server.setRequestHandler(
    ListPromptsRequestSchema,
    createPromptsListHandler(logger, mcpServers, requestedMcpServer)
  );

  server.setRequestHandler(
    GetPromptRequestSchema,
    createPromptsGetHandler(logger, mcpServers, requestedMcpServer)
  );

  server.setRequestHandler(
    ListResourcesRequestSchema,
    createResourcesListHandler(logger, mcpServers, requestedMcpServer)
  );

  server.setRequestHandler(
    ReadResourceRequestSchema,
    createResourcesReadHandler(logger, mcpServers, requestedMcpServer)
  );

  return server;
}

function createInternalServerForRequested(logger, mcpServers, requestedMcpServer) {
  return createInternalServer(logger, mcpServers, requestedMcpServer);
}

function createInternalServerFactoryWrapper(logger, mcpServers, requestedMcpServer) {
  return createInternalServerForRequested(logger, mcpServers, requestedMcpServer);
}

export function createInternalServerFactory(logger, mcpServers) {
  return (requestedMcpServer) => {
    return createInternalServerFactoryWrapper(logger, mcpServers, requestedMcpServer);
  };
}
