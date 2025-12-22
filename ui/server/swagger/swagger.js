import { components, paths } from './paths.js';

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'MCP Shark API',
    version: '1.5.4',
    description:
      'API documentation for MCP Shark - A powerful monitoring and debugging tool for Model Context Protocol (MCP) servers. Provides deep visibility into every request and response.',
    contact: {
      name: 'MCP Shark',
      url: 'https://mcpshark.sh',
    },
  },
  servers: [
    {
      url: 'http://localhost:9853',
      description: 'Development server',
    },
  ],
  tags: [
    { name: 'Requests', description: 'Traffic capture and request/response analysis' },
    { name: 'Sessions', description: 'Session management and tracking' },
    { name: 'Conversations', description: 'Conversation tracking and analysis' },
    { name: 'Statistics', description: 'Traffic statistics and analytics' },
    { name: 'Logs', description: 'MCP Shark server logs' },
    { name: 'Config', description: 'Configuration file management' },
    { name: 'Backups', description: 'Configuration backup management' },
    { name: 'Server Management', description: 'MCP Shark server lifecycle management' },
    { name: 'Help', description: 'Help and tour management' },
    { name: 'Playground', description: 'MCP playground for testing tools and resources' },
    { name: 'Smart Scan', description: 'AI-powered security analysis for MCP servers' },
    { name: 'Settings', description: 'Application settings' },
  ],
  paths,
  components,
};
