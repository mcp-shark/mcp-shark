import { Server } from '@modelcontextprotocol/sdk/server/index.js';

import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { createToolsListHandler } from './handlers/tools-list.js';
import { createToolsCallHandler } from './handlers/tools-call.js';
import { createPromptsListHandler } from './handlers/prompts-list.js';
import { createPromptsGetHandler } from './handlers/prompts-get.js';
import { createResourcesListHandler } from './handlers/resources-list.js';
import { createResourcesReadHandler } from './handlers/resources-read.js';
import { SERVER_NAME } from './handlers/common.js';

export function createInternalServer(logger, mcpServers) {
  // create MCP server
  const server = new Server(
    { name: SERVER_NAME, version: '1.0.0' },
    { capabilities: { tools: {}, prompts: {}, resources: {} } }
  );

  // Register handlers
  server.setRequestHandler(
    ListToolsRequestSchema,
    createToolsListHandler(logger, mcpServers)
  );

  server.setRequestHandler(
    CallToolRequestSchema,
    createToolsCallHandler(logger, mcpServers)
  );

  server.setRequestHandler(
    ListPromptsRequestSchema,
    createPromptsListHandler(logger, mcpServers)
  );

  server.setRequestHandler(
    GetPromptRequestSchema,
    createPromptsGetHandler(logger, mcpServers)
  );

  server.setRequestHandler(
    ListResourcesRequestSchema,
    createResourcesListHandler(logger, mcpServers)
  );

  server.setRequestHandler(
    ReadResourceRequestSchema,
    createResourcesReadHandler(logger, mcpServers)
  );

  return server;
}

export function createInternalServerFactory(logger, mcpServers) {
  return () => createInternalServer(logger, mcpServers);
}
