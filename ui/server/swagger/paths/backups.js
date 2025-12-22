/**
 * Backups endpoints - Configuration backup management
 */

export const backupsPaths = {
  '/api/config/backups': {
    get: {
      tags: ['Backups'],
      summary: 'List backups',
      description: 'Get a list of all configuration backups',
      responses: {
        200: {
          description: 'List of backups',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Backup' },
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
  '/api/config/backup/view': {
    get: {
      tags: ['Backups'],
      summary: 'View backup',
      description: 'View the contents of a backup file',
      parameters: [
        {
          name: 'backupPath',
          in: 'query',
          required: true,
          description: 'Path to backup file',
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Backup file content',
          content: {
            'application/json': {
              schema: { type: 'object' },
            },
          },
        },
        404: {
          description: 'Backup not found',
        },
        500: {
          description: 'Internal server error',
        },
      },
    },
  },
  '/api/config/restore': {
    post: {
      tags: ['Backups'],
      summary: 'Restore backup',
      description: 'Restore a configuration file from a backup',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['backupPath'],
              properties: {
                backupPath: { type: 'string', description: 'Path to backup file' },
                originalPath: { type: 'string', description: 'Path to original file (optional)' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Backup restored successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  originalPath: { type: 'string' },
                  wasPatched: { type: 'boolean' },
                  repatched: { type: 'boolean' },
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
  '/api/config/backup/delete': {
    post: {
      tags: ['Backups'],
      summary: 'Delete backup',
      description: 'Delete a configuration backup',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['backupPath'],
              properties: {
                backupPath: { type: 'string', description: 'Path to backup file' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Backup deleted successfully',
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
        404: {
          description: 'Backup not found',
        },
        500: {
          description: 'Internal server error',
        },
      },
    },
  },
};
