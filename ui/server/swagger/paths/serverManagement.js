/**
 * Server Management endpoints - MCP Shark server lifecycle management
 */

export const serverManagementPaths = {
  '/api/composite/setup': {
    post: {
      tags: ['Server Management'],
      summary: 'Setup and start MCP Shark server',
      description:
        'Configure and start the MCP Shark server with a given configuration file. This will process the config, patch it if needed, and start the server.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                filePath: { type: 'string', description: 'Path to config file' },
                fileContent: { type: 'string', description: 'Config file content' },
                selectedServices: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'List of service names to include',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Server started successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  convertedConfig: { type: 'object' },
                  updatedConfig: { type: 'object' },
                  filePath: { type: 'string' },
                  backupPath: { type: 'string', nullable: true },
                  warning: { type: 'string' },
                },
              },
            },
          },
        },
        400: {
          description: 'Bad request',
        },
        404: {
          description: 'File not found',
        },
        500: {
          description: 'Internal server error',
        },
      },
    },
  },
  '/api/composite/stop': {
    post: {
      tags: ['Server Management'],
      summary: 'Stop MCP Shark server',
      description: 'Stop the running MCP Shark server and restore original configuration',
      responses: {
        200: {
          description: 'Server stopped successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        500: {
          description: 'Internal server error',
        },
      },
    },
  },
  '/api/composite/status': {
    get: {
      tags: ['Server Management'],
      summary: 'Get server status',
      description: 'Get the current status of the MCP Shark server',
      responses: {
        200: {
          description: 'Server status',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  running: { type: 'boolean' },
                  pid: { type: 'integer', nullable: true },
                },
              },
            },
          },
        },
        500: {
          description: 'Internal server error',
        },
      },
    },
  },
  '/api/mcp-server/status': {
    get: {
      tags: ['Server Management'],
      summary: 'Check MCP server (gateway) status',
      description:
        'Check if the MCP server (gateway) is running. This endpoint specifically indicates whether the MCP gateway server is active, so users can know if they should focus on the traffic page.',
      responses: {
        200: {
          description: 'MCP server status',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  running: {
                    type: 'boolean',
                    description: 'Whether the MCP server (gateway) is running',
                    example: true,
                  },
                  message: {
                    type: 'string',
                    description: 'Human-readable status message',
                    example: 'MCP server (gateway) is running and ready to receive traffic',
                  },
                },
                required: ['running', 'message'],
              },
            },
          },
        },
        500: {
          description: 'Internal server error',
        },
      },
    },
  },
  '/api/composite/shutdown': {
    post: {
      tags: ['Server Management'],
      summary: 'Shutdown application',
      description: 'Gracefully shutdown the entire application',
      responses: {
        200: {
          description: 'Shutdown initiated',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        500: {
          description: 'Internal server error',
        },
      },
    },
  },
  '/api/composite/servers': {
    get: {
      tags: ['Server Management'],
      summary: 'Get configured servers',
      description: 'Get a list of all configured MCP servers',
      responses: {
        200: {
          description: 'List of servers',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  servers: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        500: {
          description: 'Internal server error',
        },
      },
    },
  },
};
