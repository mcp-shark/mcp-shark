/**
 * Conversations endpoints - Conversation tracking and analysis
 */

export const conversationsPaths = {
  '/api/conversations': {
    get: {
      tags: ['Conversations'],
      summary: 'Get all conversations',
      description: 'Retrieve a list of all tracked conversations',
      responses: {
        200: {
          description: 'List of conversations',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Conversation' },
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
