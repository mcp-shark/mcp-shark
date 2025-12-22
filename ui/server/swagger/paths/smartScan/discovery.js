/**
 * Smart Scan - Discovery and cache endpoints
 */

export const discoveryPaths = {
  '/api/smartscan/discover': {
    get: {
      tags: ['Smart Scan'],
      summary: 'Discover MCP servers',
      description: 'Discover MCP servers from configuration files',
      responses: {
        200: {
          description: 'List of discovered servers',
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
  '/api/smartscan/cached-results': {
    post: {
      tags: ['Smart Scan'],
      summary: 'Get cached results',
      description: 'Get cached scan results for a server',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['serverName'],
              properties: {
                serverName: { type: 'string', description: 'Name of the server' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Cached results',
          content: {
            'application/json': {
              schema: { type: 'object' },
            },
          },
        },
        404: {
          description: 'No cached results found',
        },
        500: {
          description: 'Internal server error',
        },
      },
    },
  },
  '/api/smartscan/cache/clear': {
    post: {
      tags: ['Smart Scan'],
      summary: 'Clear scan cache',
      description: 'Clear all cached scan results',
      responses: {
        200: {
          description: 'Cache cleared',
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
};
