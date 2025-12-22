/**
 * Statistics endpoints - Traffic statistics and analytics
 */

export const statisticsPaths = {
  '/api/statistics': {
    get: {
      tags: ['Statistics'],
      summary: 'Get traffic statistics',
      description: 'Retrieve aggregated statistics about captured traffic',
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
      ],
      responses: {
        200: {
          description: 'Traffic statistics',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Statistics' },
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
