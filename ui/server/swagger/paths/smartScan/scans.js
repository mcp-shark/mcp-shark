/**
 * Smart Scan - Scan endpoints
 * Create, list, and retrieve scan results
 */

export const scansPaths = {
  '/api/smartscan/scans': {
    get: {
      tags: ['Smart Scan'],
      summary: 'List scans',
      description: 'Get a list of all cached Smart Scan results',
      responses: {
        200: {
          description: 'List of scans',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Scan' },
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
      summary: 'Create scan',
      description: 'Create a new Smart Scan for an MCP server',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['apiToken', 'scanData'],
              properties: {
                apiToken: { type: 'string', description: 'Smart Scan API token' },
                scanData: {
                  type: 'object',
                  description: 'Scan configuration data',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Scan created',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Scan' },
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
  '/api/smartscan/scans/{scanId}': {
    get: {
      tags: ['Smart Scan'],
      summary: 'Get scan',
      description: 'Get details of a specific scan',
      parameters: [
        {
          name: 'scanId',
          in: 'path',
          required: true,
          description: 'Scan ID',
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Scan details',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Scan' },
            },
          },
        },
        404: {
          description: 'Scan not found',
        },
        500: {
          description: 'Internal server error',
        },
      },
    },
  },
  '/api/smartscan/scans/batch': {
    post: {
      tags: ['Smart Scan'],
      summary: 'Create batch scans',
      description: 'Create multiple scans for multiple servers',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['apiToken', 'servers'],
              properties: {
                apiToken: { type: 'string', description: 'Smart Scan API token' },
                servers: {
                  type: 'array',
                  items: { type: 'object' },
                  description: 'List of server configurations to scan',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Batch scans created',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  scans: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Scan' },
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
};
