/**
 * OpenAPI component schemas
 */

export const components = {
  schemas: {
    Request: {
      type: 'object',
      properties: {
        frame_number: { type: 'integer' },
        timestamp_iso: { type: 'string' },
        session_id: { type: 'string' },
        server_name: { type: 'string' },
        direction: { type: 'string' },
        request: { type: 'object' },
        response: { type: 'object' },
        jsonrpc_method: { type: 'string' },
        jsonrpc_id: { type: 'string' },
        length: { type: 'integer' },
      },
    },
    Session: {
      type: 'object',
      properties: {
        session_id: { type: 'string' },
        server_name: { type: 'string' },
        created_at: { type: 'string' },
        last_request_at: { type: 'string' },
      },
    },
    Conversation: {
      type: 'object',
      properties: {
        conversation_id: { type: 'string' },
        session_id: { type: 'string' },
        created_at: { type: 'string' },
      },
    },
    Statistics: {
      type: 'object',
      properties: {
        totalRequests: { type: 'integer' },
        totalSessions: { type: 'integer' },
        totalConversations: { type: 'integer' },
        requestsByMethod: { type: 'object' },
        requestsByStatus: { type: 'object' },
      },
    },
    LogEntry: {
      type: 'object',
      properties: {
        timestamp: { type: 'string' },
        type: { type: 'string' },
        line: { type: 'string' },
      },
    },
    Backup: {
      type: 'object',
      properties: {
        backupPath: { type: 'string' },
        originalPath: { type: 'string' },
        createdAt: { type: 'string' },
      },
    },
    Scan: {
      type: 'object',
      properties: {
        scanId: { type: 'string' },
        serverName: { type: 'string' },
        status: { type: 'string' },
        createdAt: { type: 'string' },
        results: { type: 'object' },
      },
    },
  },
};
