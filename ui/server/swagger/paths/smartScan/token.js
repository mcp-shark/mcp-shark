/**
 * Smart Scan - Token management endpoints
 */

export const tokenPaths = {
  '/api/smartscan/token': {
    get: {
      tags: ['Smart Scan'],
      summary: 'Get API token',
      description: 'Get the stored Smart Scan API token',
      responses: {
        200: {
          description: 'API token',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  token: { type: 'string', nullable: true },
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
    post: {
      tags: ['Smart Scan'],
      summary: 'Save API token',
      description: 'Save the Smart Scan API token',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['token'],
              properties: {
                token: { type: 'string', description: 'Smart Scan API token' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Token saved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
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
};
