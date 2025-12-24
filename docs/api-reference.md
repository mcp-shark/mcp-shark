# API Reference

Complete reference for MCP Shark's API endpoints and WebSocket protocol.

## Interactive API Documentation

**Swagger/OpenAPI Documentation** is available at `/api-docs` when the server is running:

- **Local**: [http://localhost:9853/api-docs](http://localhost:9853/api-docs)
- **Discovery Button**: Click the menu button (☰) in the bottom-right corner of the UI, then select the API docs button (📡) from the expandable action menu

The Swagger UI provides:
- Complete endpoint documentation with request/response schemas
- Interactive API testing directly from the browser
- Parameter descriptions and examples
- Response code documentation
- All 40+ endpoints organized by category

## Base URL

- **Development**: `http://localhost:9853`
- **Production**: Configure based on your deployment

## Traffic & Monitoring

### GET /api/requests

Retrieve communication requests/responses with optional filtering.

**Query Parameters:**
- `limit` (number): Maximum number of results (default: 5000)
- `offset` (number): Number of results to skip (default: 0)
- `search` (string): Full-text search across all fields
- `serverName` (string): Filter by server name
- `sessionId` (string): Filter by session ID
- `direction` (string): Filter by direction (request/response)
- `method` (string): Filter by HTTP method
- `jsonrpcMethod` (string): Filter by JSON-RPC method
- `statusCode` (number): Filter by HTTP status code
- `jsonrpcId` (string): Filter by JSON-RPC request ID
- `startTime` (string): Filter by start time (ISO format)
- `endTime` (string): Filter by end time (ISO format)

**Response:**
```json
[
  {
    "frame_number": 1,
    "timestamp_iso": "2024-01-01T00:00:00.000Z",
    "direction": "request",
    "method": "POST",
    "server_name": "github",
    "session_id": "abc123",
    "jsonrpc_method": "tools/list",
    "jsonrpc_id": "req-1",
    "request": { /* request object */ },
    "response": { /* response object */ },
    "length": 1024
  }
]
```

**Note:** `/api/packets` is an alias for this endpoint.

### GET /api/requests/:frameNumber

Get a specific request/response by frame number.

**Path Parameters:**
- `frameNumber` (number): Frame number of the request

**Response:**
```json
{
  "frame_number": 1,
  "timestamp_iso": "2024-01-01T00:00:00.000Z",
  "direction": "request",
  "method": "POST",
  "server_name": "github",
  "session_id": "abc123",
  "jsonrpc_method": "tools/list",
  "jsonrpc_id": "req-1",
  "request": { /* request object */ },
  "response": { /* response object */ },
  "length": 1024
}
```

**Note:** `/api/packets/:frameNumber` is an alias for this endpoint.

### GET /api/requests/export

Export captured requests in CSV, TXT, or JSON format.

**Query Parameters:**
- `format` (string): Export format - `csv`, `txt`, or `json` (default: `json`)
- `sessionId` (string): Filter by session ID
- `serverName` (string): Filter by server name
- `method` (string): Filter by HTTP method
- `jsonrpcMethod` (string): Filter by JSON-RPC method
- `statusCode` (number): Filter by HTTP status code
- `search` (string): Full-text search

**Response:**
Returns a file download with appropriate Content-Type header:
- CSV: `text/csv`
- TXT: `text/plain`
- JSON: `application/json`

### POST /api/requests/clear

Clear all captured requests from the database.

**Response:**
```json
{
  "success": true,
  "message": "Cleared 3 table(s): packets, sessions, conversations. All captured traffic has been cleared."
}
```

### GET /api/conversations

Get request/response conversation pairs.

**Query Parameters:**
- `limit` (number): Maximum number of results
- `sessionId` (string): Filter by session ID

**Response:**
```json
[
  {
    "request": { /* request object */ },
    "response": { /* response object */ }
  }
]
```

### GET /api/sessions

List all sessions.

**Response:**
```json
[
  {
    "session_id": "abc123",
    "server_name": "github",
    "created_at": "2024-01-01T00:00:00.000Z",
    "last_request_at": "2024-01-01T00:05:00.000Z"
  }
]
```

### GET /api/sessions/:sessionId/requests

Get all requests for a specific session.

**Path Parameters:**
- `sessionId` (string): Session ID

**Response:**
```json
[
  {
    "frame_number": 1,
    "timestamp_iso": "2024-01-01T00:00:00.000Z",
    "direction": "request",
    "method": "POST",
    "server_name": "github",
    "session_id": "abc123",
    "request": { /* request object */ },
    "response": { /* response object */ }
  }
]
```

**Note:** `/api/sessions/:sessionId/packets` is an alias for this endpoint.

### GET /api/statistics

Get traffic statistics.

**Query Parameters:**
- `search` (string): Filter statistics by search term
- `serverName` (string): Filter by server name
- `sessionId` (string): Filter by session ID
- `method` (string): Filter by HTTP method
- `jsonrpcMethod` (string): Filter by JSON-RPC method
- `statusCode` (number): Filter by HTTP status code
- `jsonrpcId` (string): Filter by JSON-RPC request ID

**Response:**
```json
{
  "total_requests": 1000,
  "unique_sessions": 50,
  "servers": {
    "github": 500,
    "filesystem": 300,
    "database": 200
  },
  "methods": {
    "tools/list": 400,
    "tools/call": 300,
    "prompts/list": 200,
    "resources/list": 100
  }
}
```

## MCP Server Management

### GET /api/composite/status

Get the status of the MCP Shark server.

**Response:**
```json
{
  "running": true,
  "pid": null
}
```

**Note:** When using the library mode (not a separate process), `pid` will be `null`.

### GET /api/mcp-server/status

Check if the MCP server (gateway) is running. This endpoint specifically indicates whether the MCP gateway server is active, so users can know if they should focus on the traffic page.

**Response:**
```json
{
  "running": true,
  "message": "MCP server (gateway) is running and ready to receive traffic"
}
```

**When `running` is `false`:**
```json
{
  "running": false,
  "message": "MCP server (gateway) is not running. Start the server to begin capturing traffic."
}
```

**Use Case:** This endpoint is useful for checking if the MCP gateway server is active before focusing on the traffic monitoring page. It provides a clear indication of whether traffic will be captured.

### GET /api/composite/logs

Get MCP Shark server logs.

**Query Parameters:**
- `limit` (number): Maximum number of log entries (default: 1000)
- `offset` (number): Number of log entries to skip (default: 0)

**Response:**
```json
[
  {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "type": "stdout",
    "line": "Server started on port 9851"
  }
]
```

### GET /api/composite/servers

Get available server names from configuration.

**Response:**
```json
{
  "servers": ["github", "filesystem", "database"]
}
```

### POST /api/composite/setup

Configure and start the MCP Shark server.

**Request Body:**
```json
{
  "filePath": "~/.cursor/mcp.json",
  "fileContent": "{ /* optional: config file content as string */ }",
  "selectedServices": ["github", "filesystem"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "MCP Shark server started successfully and config file updated",
  "convertedConfig": { /* converted MCP Shark config */ },
  "updatedConfig": { /* updated original config */ },
  "filePath": "~/.cursor/mcp.json",
  "backupPath": null,
  "warning": "Optional warning message"
}
```

### POST /api/composite/stop

Stop the MCP Shark server and restore original configuration.

**Response:**
```json
{
  "success": true,
  "message": "MCP Shark server stopped and config restored"
}
```

### POST /api/composite/shutdown

Gracefully shutdown the entire application.

**Response:**
```json
{
  "success": true,
  "message": "Application shutdown initiated"
}
```

**Note:** This endpoint triggers a graceful shutdown of the entire application, including the MCP Shark server.

### POST /api/composite/logs/clear

Clear server logs.

**Response:**
```json
{
  "success": true,
  "message": "Logs cleared"
}
```

### GET /api/composite/logs/export

Export logs as a text file.

**Response:**
Returns a text file download with `text/plain` Content-Type.

## Configuration

### GET /api/config/detect

Detect default MCP config file paths.

**Response:**
```json
{
  "paths": [
    {
      "path": "~/.cursor/mcp.json",
      "exists": true,
      "type": "cursor"
    },
    {
      "path": "~/.codeium/windsurf/mcp_config.json",
      "exists": false,
      "type": "windsurf"
    }
  ]
}
```

### GET /api/config/read

Read MCP configuration file.

**Query Parameters:**
- `path` (string): Path to configuration file

**Response:**
```json
{
  "config": { /* MCP configuration */ },
  "path": "~/.cursor/mcp.json"
}
```

### POST /api/config/services

Extract services from config.

**Request Body:**
```json
{
  "filePath": "~/.cursor/mcp.json",
  "fileContent": "{ /* MCP configuration JSON string */ }"
}
```

**Response:**
```json
{
  "services": ["github", "filesystem", "database"]
}
```

## Backups

### GET /api/config/backups

List all configuration backups.

**Response:**
```json
[
  {
    "backupPath": "~/.mcp-shark/backups/mcp.json.2024-01-01T00:00:00.000Z.backup",
    "originalPath": "~/.cursor/mcp.json",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### GET /api/config/backup/view

View the contents of a backup file.

**Query Parameters:**
- `backupPath` (string, required): Path to backup file

**Response:**
```json
{
  "backupPath": "~/.mcp-shark/backups/mcp.json.2024-01-01T00:00:00.000Z.backup",
  "originalPath": "~/.cursor/mcp.json",
  "content": { /* MCP configuration */ }
}
```

### POST /api/config/restore

Restore a configuration file from a backup.

**Request Body:**
```json
{
  "backupPath": "~/.mcp-shark/backups/mcp.json.2024-01-01T00:00:00.000Z.backup",
  "originalPath": "~/.cursor/mcp.json"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Config file restored from backup",
  "originalPath": "~/.cursor/mcp.json",
  "wasPatched": false,
  "repatched": false
}
```

**Note:** If the backup was patched and the server is running, it will be automatically repatched.

### POST /api/config/backup/delete

Delete a configuration backup.

**Request Body:**
```json
{
  "backupPath": "~/.mcp-shark/backups/mcp.json.2024-01-01T00:00:00.000Z.backup"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Backup deleted successfully"
}
```

## Playground

### POST /api/playground/proxy

Proxy MCP requests for testing.

**Request Body:**
```json
{
  "method": "tools/list",
  "serverName": "github",
  "params": {},
  "sessionId": "optional-session-id"
}
```

**Response:**
```json
{
  "result": {
    "tools": [
      {
        "name": "search_repositories",
        "description": "Search GitHub repositories"
      }
    ]
  }
}
```

**Note:** The `sessionId` is optional and used for stateful requests. If not provided, a new session will be created.

## Help

### GET /api/help/state

Get the current state of the help tour.

**Response:**
```json
{
  "dismissed": false,
  "tourCompleted": false
}
```

### POST /api/help/dismiss

Mark the help tour as dismissed.

**Response:**
```json
{
  "success": true
}
```

### POST /api/help/reset

Reset the help tour state to show it again.

**Response:**
```json
{
  "success": true
}
```

## Smart Scan

### POST /api/smartscan/scans

Create a new scan.

**Request Body:**
```json
{
  "apiToken": "your-smart-scan-api-token",
  "scanData": {
    "serverName": "github",
    "serverConfig": { /* MCP server configuration */ }
  }
}
```

**Response:**
```json
{
  "scanId": "scan-123",
  "serverName": "github",
  "status": "processing",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "results": { /* scan results */ }
}
```

### GET /api/smartscan/scans

List all scans.

**Response:**
```json
[
  {
    "id": "scan-123",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "servers": ["github"],
    "status": "completed"
  }
]
```

### GET /api/smartscan/scans/:scanId

Get scan details.

**Response:**
```json
{
  "id": "scan-123",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "servers": ["github"],
  "status": "completed",
  "results": {
    "github": {
      "riskLevel": "medium",
      "findings": [ /* ... */ ]
    }
  }
}
```

### GET /api/smartscan/token

Get Smart Scan API token.

**Response:**
```json
{
  "token": "your-token-here",
  "exists": true
}
```

### POST /api/smartscan/token

Save Smart Scan API token.

**Request Body:**
```json
{
  "token": "your-token-here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token saved"
}
```

### GET /api/smartscan/discover

Discover MCP servers from configuration files.

**Response:**
```json
{
  "servers": ["github", "filesystem", "database"]
}
```

### POST /api/smartscan/scans/batch

Create multiple scans for multiple servers.

**Request Body:**
```json
{
  "apiToken": "your-smart-scan-api-token",
  "servers": [
    {
      "serverName": "github",
      "serverConfig": { /* MCP server configuration */ }
    },
    {
      "serverName": "filesystem",
      "serverConfig": { /* MCP server configuration */ }
    }
  ]
}
```

**Response:**
```json
{
  "scans": [
    {
      "scanId": "scan-123",
      "serverName": "github",
      "status": "processing"
    },
    {
      "scanId": "scan-124",
      "serverName": "filesystem",
      "status": "processing"
    }
  ]
}
```

### POST /api/smartscan/cached-results

Get cached scan results for a server.

**Request Body:**
```json
{
  "serverName": "github"
}
```

**Response:**
```json
{
  "serverName": "github",
  "scanId": "scan-123",
  "status": "completed",
  "results": { /* cached scan results */ }
}
```

### POST /api/smartscan/cache/clear

Clear all cached scan results.

**Response:**
```json
{
  "success": true,
  "message": "Scan cache cleared"
}
```

## Settings

### GET /api/settings

Get all application settings and paths.

**Response:**
```json
{
  "paths": {
    "workingDirectory": {
      "absolute": "/Users/user/.mcp-shark",
      "display": "~/.mcp-shark",
      "exists": true
    },
    "database": {
      "absolute": "/Users/user/.mcp-shark/db/mcp-shark.sqlite",
      "display": "~/.mcp-shark/db/mcp-shark.sqlite",
      "exists": true
    },
    "smartScanResults": {
      "absolute": "/Users/user/.mcp-shark/scan-results",
      "display": "~/.mcp-shark/scan-results",
      "exists": true
    },
    "smartScanToken": {
      "absolute": "/Users/user/.mcp-shark/smart-scan-token.json",
      "display": "~/.mcp-shark/smart-scan-token.json",
      "exists": true
    }
  },
  "smartScan": {
    "token": "your-token",
    "tokenExists": true
  },
  "database": {
    "path": {
      "absolute": "/Users/user/.mcp-shark/db/mcp-shark.sqlite",
      "display": "~/.mcp-shark/db/mcp-shark.sqlite"
    },
    "exists": true
  },
  "backups": {
    "count": 5
  }
}
```

## WebSocket

The server broadcasts real-time updates via WebSocket on the same port as the HTTP server.

### Connection

- **Development**: `ws://localhost:9853`
- **Production**: `wss://your-domain.com` (if using HTTPS)

### Message Format

**Update Message:**
```json
{
  "type": "update",
  "data": [
    /* array of request/response objects */
  ]
}
```

**Error Message:**
```json
{
  "type": "error",
  "message": "Error description"
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

**Status Codes:**
- `200`: Success
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

