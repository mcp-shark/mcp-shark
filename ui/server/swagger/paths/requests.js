/**
 * Requests endpoints - Traffic capture and request/response analysis
 */

export const requestsPaths = {
  '/api/requests': {
    get: {
      tags: ['Requests'],
      summary: 'Get captured requests/packets',
      description:
        'Retrieve captured HTTP requests and responses with optional filtering. Supports filtering by session, server, method, status code, and more.',
      parameters: [
        {
          name: 'sessionId',
          in: 'query',
          description: 'Filter by session ID',
          schema: { type: 'string' },
        },
        {
          name: 'serverName',
          in: 'query',
          description: 'Filter by server name',
          schema: { type: 'string' },
        },
        {
          name: 'method',
          in: 'query',
          description: 'Filter by HTTP method',
          schema: { type: 'string' },
        },
        {
          name: 'statusCode',
          in: 'query',
          description: 'Filter by HTTP status code',
          schema: { type: 'integer' },
        },
        {
          name: 'jsonrpcMethod',
          in: 'query',
          description: 'Filter by JSON-RPC method',
          schema: { type: 'string' },
        },
        {
          name: 'search',
          in: 'query',
          description: 'Search in request/response content',
          schema: { type: 'string' },
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Maximum number of results',
          schema: { type: 'integer', default: 5000 },
        },
        {
          name: 'offset',
          in: 'query',
          description: 'Number of results to skip',
          schema: { type: 'integer', default: 0 },
        },
      ],
      responses: {
        200: {
          description: 'List of captured requests',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Request' },
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
  '/api/requests/{frameNumber}': {
    get: {
      tags: ['Requests'],
      summary: 'Get request by frame number',
      description: 'Retrieve a specific captured request/response by its frame number',
      parameters: [
        {
          name: 'frameNumber',
          in: 'path',
          required: true,
          description: 'Frame number of the request',
          schema: { type: 'integer' },
        },
      ],
      responses: {
        200: {
          description: 'Request details',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Request' },
            },
          },
        },
        404: {
          description: 'Request not found',
        },
        500: {
          description: 'Internal server error',
        },
      },
    },
  },
  '/api/requests/export': {
    get: {
      tags: ['Requests'],
      summary: 'Export captured requests',
      description: 'Export captured requests in CSV, TXT, or JSON format',
      parameters: [
        {
          name: 'format',
          in: 'query',
          description: 'Export format (csv, txt, json)',
          schema: { type: 'string', enum: ['csv', 'txt', 'json'], default: 'json' },
        },
        {
          name: 'sessionId',
          in: 'query',
          description: 'Filter by session ID',
          schema: { type: 'string' },
        },
        {
          name: 'serverName',
          in: 'query',
          description: 'Filter by server name',
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Exported data file',
          content: {
            'text/csv': { schema: { type: 'string' } },
            'text/plain': { schema: { type: 'string' } },
            'application/json': { schema: { type: 'object' } },
          },
        },
        500: {
          description: 'Internal server error',
        },
      },
    },
  },
  '/api/requests/clear': {
    post: {
      tags: ['Requests'],
      summary: 'Clear all captured requests',
      description: 'Delete all captured traffic from the database',
      responses: {
        200: {
          description: 'Traffic cleared successfully',
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
