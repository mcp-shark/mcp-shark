/**
 * Logs endpoints - MCP Shark server logs
 */

export const logsPaths = {
  '/api/composite/logs': {
    get: {
      tags: ['Logs'],
      summary: 'Get MCP Shark server logs',
      description: 'Retrieve logs from the MCP Shark server',
      parameters: [
        {
          name: 'limit',
          in: 'query',
          description: 'Maximum number of log entries',
          schema: { type: 'integer', default: 1000 },
        },
        {
          name: 'offset',
          in: 'query',
          description: 'Number of log entries to skip',
          schema: { type: 'integer', default: 0 },
        },
      ],
      responses: {
        200: {
          description: 'List of log entries',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/LogEntry' },
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
  '/api/composite/logs/clear': {
    post: {
      tags: ['Logs'],
      summary: 'Clear all logs',
      description: 'Delete all log entries',
      responses: {
        200: {
          description: 'Logs cleared successfully',
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
  '/api/composite/logs/export': {
    get: {
      tags: ['Logs'],
      summary: 'Export logs',
      description: 'Export logs as a text file',
      responses: {
        200: {
          description: 'Logs file',
          content: {
            'text/plain': { schema: { type: 'string' } },
          },
        },
        500: {
          description: 'Internal server error',
        },
      },
    },
  },
};
