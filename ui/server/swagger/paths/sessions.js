/**
 * Sessions endpoints - Session management and tracking
 */

export const sessionsPaths = {
  '/api/sessions': {
    get: {
      tags: ['Sessions'],
      summary: 'Get all sessions',
      description: 'Retrieve a list of all captured sessions',
      responses: {
        200: {
          description: 'List of sessions',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Session' },
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
  '/api/sessions/{sessionId}/requests': {
    get: {
      tags: ['Sessions'],
      summary: 'Get requests for a session',
      description: 'Retrieve all requests belonging to a specific session',
      parameters: [
        {
          name: 'sessionId',
          in: 'path',
          required: true,
          description: 'Session ID',
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'List of requests for the session',
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
};
