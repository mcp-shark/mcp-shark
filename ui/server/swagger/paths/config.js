/**
 * Config endpoints - Configuration file management
 */

export const configPaths = {
  '/api/config/services': {
    post: {
      tags: ['Config'],
      summary: 'Extract services from config',
      description: 'Extract MCP server configurations from a config file',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                filePath: { type: 'string', description: 'Path to config file' },
                fileContent: { type: 'string', description: 'Config file content' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Extracted services',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  services: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Bad request',
        },
        500: {
          description: 'Internal server error',
        },
      },
    },
  },
  '/api/config/read': {
    get: {
      tags: ['Config'],
      summary: 'Read config file',
      description: 'Read and parse a configuration file',
      parameters: [
        {
          name: 'filePath',
          in: 'query',
          required: true,
          description: 'Path to config file',
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Config file content',
          content: {
            'application/json': {
              schema: { type: 'object' },
            },
          },
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
  '/api/config/detect': {
    get: {
      tags: ['Config'],
      summary: 'Detect config files',
      description: 'Detect MCP configuration files in common locations',
      responses: {
        200: {
          description: 'List of detected config files',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  configs: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        path: { type: 'string' },
                        editor: { type: 'string' },
                      },
                    },
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
