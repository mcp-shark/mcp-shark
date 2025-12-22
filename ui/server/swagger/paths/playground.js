/**
 * Playground endpoints - MCP playground for testing tools and resources
 */

export const playgroundPaths = {
  '/api/playground/proxy': {
    post: {
      tags: ['Playground'],
      summary: 'Proxy MCP request',
      description: 'Proxy a request to an MCP server through the playground',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['method', 'serverName'],
              properties: {
                method: {
                  type: 'string',
                  description: 'MCP method to call (e.g., tools/list, prompts/list)',
                },
                serverName: { type: 'string', description: 'Name of the MCP server' },
                params: { type: 'object', description: 'Method parameters' },
                sessionId: { type: 'string', description: 'Session ID for the request' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'MCP response',
          content: {
            'application/json': {
              schema: { type: 'object' },
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
};
