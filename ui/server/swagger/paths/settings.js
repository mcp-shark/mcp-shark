/**
 * Settings endpoints - Application settings
 */

export const settingsPaths = {
  '/api/settings': {
    get: {
      tags: ['Settings'],
      summary: 'Get settings',
      description: 'Get application settings',
      responses: {
        200: {
          description: 'Application settings',
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
  },
};
