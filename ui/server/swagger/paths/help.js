/**
 * Help endpoints - Help and tour management
 */

export const helpPaths = {
  '/api/help/state': {
    get: {
      tags: ['Help'],
      summary: 'Get help tour state',
      description: 'Get the current state of the help tour (dismissed/completed)',
      responses: {
        200: {
          description: 'Tour state',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  dismissed: { type: 'boolean' },
                  tourCompleted: { type: 'boolean' },
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
  '/api/help/dismiss': {
    post: {
      tags: ['Help'],
      summary: 'Dismiss help tour',
      description: 'Mark the help tour as dismissed',
      responses: {
        200: {
          description: 'Tour dismissed',
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
        500: {
          description: 'Internal server error',
        },
      },
    },
  },
  '/api/help/reset': {
    post: {
      tags: ['Help'],
      summary: 'Reset help tour',
      description: 'Reset the help tour state to show it again',
      responses: {
        200: {
          description: 'Tour reset',
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
        500: {
          description: 'Internal server error',
        },
      },
    },
  },
};
