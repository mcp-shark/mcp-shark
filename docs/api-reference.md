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
- `aauthPosture` (string): Filter by AAuth posture — `signed`, `aauth-aware`, `bearer`, `bearer-coexist`, or `none`
- `aauthAgent` (string): Filter by AAuth agent identity (`aauth:<local>@<domain>`)
- `aauthMission` (string): Filter by AAuth mission id

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

List all configuration backups. Backups are stored next to the original config
file as a hidden file with a `-mcpshark.<datetime>.json` suffix (the legacy
`.backup` form is also recognised). Only Cursor and Windsurf directories are
scanned.

**Response:**
```json
[
  {
    "backupPath": "~/.cursor/.mcp.json-mcpshark.2024-01-01_12-00-00.json",
    "originalPath": "~/.cursor/mcp.json",
    "displayPath": "~/.cursor/mcp.json",
    "backupFileName": ".mcp.json-mcpshark.2024-01-01_12-00-00.json",
    "size": 1024,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "modifiedAt": "2024-01-01T12:00:00.000Z"
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
  "backupPath": "~/.cursor/.mcp.json-mcpshark.2024-01-01_12-00-00.json",
  "displayPath": "~/.cursor/.mcp.json-mcpshark.2024-01-01_12-00-00.json",
  "content": "{ /* raw file content as string */ }",
  "parsed": { /* parsed JSON if applicable */ },
  "size": 1024,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "modifiedAt": "2024-01-01T12:00:00.000Z"
}
```

### POST /api/config/restore

Restore a configuration file from a backup.

**Request Body:**
```json
{
  "backupPath": "~/.cursor/.mcp.json-mcpshark.2024-01-01_12-00-00.json",
  "originalPath": "~/.cursor/mcp.json"
}
```

**Response:**
```json
{
  "success": true,
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
  "backupPath": "~/.cursor/.mcp.json-mcpshark.2024-01-01_12-00-00.json"
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

## AAuth Visibility

All AAuth endpoints are observability-only — mcp-shark never verifies signatures
or fetches keys. See the [AAuth Visibility doc](aauth-visibility.md) for the
underlying contract.

### GET /api/aauth/posture

Aggregate posture summary across captured traffic.

**Response:**
```json
{
  "observed": true,
  "verified": false,
  "total_packets": 124,
  "counts": { "signed": 96, "aauth-aware": 4, "bearer": 16, "none": 8 },
  "signed_ratio": 0.774,
  "unique_agents": ["aauth:cursor-instance-7@hellocoop.dev"],
  "unique_missions": ["m_2026-04-26_a"],
  "note": "mcp-shark records AAuth signals as observed only; signatures are not verified."
}
```

### GET /api/aauth/missions

List observed AAuth missions and their members.

### GET /api/aauth/graph

Force-directed graph data for the AAuth Explorer view (nodes for agents,
missions, resources, signing algorithms, access modes; edges grounded in
captured packet evidence).

### GET /api/aauth/upstreams

Per-upstream AAuth posture rollup (which servers have signed traffic, which are
bearer-only, etc.).

### GET /api/aauth/node/:category/:id

Packets associated with a specific graph node (e.g. all packets for one agent).

**Path Parameters:**
- `category` (string): One of `agent`, `mission`, `resource`, `algorithm`, `access`
- `id` (string): Node identifier from the graph response

### POST /api/aauth/self-test

Inject synthetic AAuth-shaped packets so the UI / graph / posture endpoints have
demo data even without a live AAuth-aware MCP. Used by CI and the
`aauth-traffic-generator.js` legacy shim.

**Request Body:**
```json
{ "rounds": 2 }
```

**Response:**
```json
{ "success": true, "inserted": 14 }
```

## Security

### GET /api/security/rules

List available rules (declarative + JS plugins).

### POST /api/security/scan

Scan a single MCP server config snapshot.

### POST /api/security/scan/batch

Scan multiple server configs in a single request.

### POST /api/security/analyse

Run static analysis against the MCP servers currently running through the proxy.

**Response:**
```json
{
  "success": true,
  "serversScanned": 2,
  "totalFindings": 5,
  "results": [ /* per-server findings */ ]
}
```

### GET /api/security/findings

List stored findings. Supports `?severity=`, `?serverName=`, `?ruleId=`,
`?scanId=`, `?finding_type=`, `?limit=`, `?offset=`.

### GET /api/security/findings/:id

Get a single finding by id.

### GET /api/security/summary

Aggregate counts by severity, OWASP id, and target type.

### GET /api/security/history

Historical scan summaries (`?limit=` supported).

### POST /api/security/findings/clear

Remove all findings, scan history, and reset the in-memory toxic-flow registry.

### DELETE /api/security/scan/:scanId

Delete findings produced by a single scan run.

### GET /api/security/traffic-toxic-flows

Latest cross-server pairings inferred from `tools/list` responses observed on
the HTTP proxy.

### POST /api/security/traffic-toxic-flows/replay

Rebuild the toxic-flow model from stored `packets` rows (responses with
`tools` in their JSON-RPC result).

### Engine & rule sources

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/security/engine/status` | GET | Pattern engine status (regex / YARA hint) |
| `/api/security/engine/load` | POST | Reload rules from disk into the engine |
| `/api/security/sources` | GET | List configured rule sources (GitHub / URL / local) |
| `/api/security/sources` | POST | Add a new rule source |
| `/api/security/sources/:name` | DELETE | Remove a rule source |
| `/api/security/sources/:name/sync` | POST | Sync a single rule source |
| `/api/security/sources/sync` | POST | Sync all rule sources |
| `/api/security/sources/initialize` | POST | Initialize the default rule sources |
| `/api/security/community-rules` | GET | List community / synced rules |
| `/api/security/community-rules` | POST | Add a custom user rule |
| `/api/security/community-rules/:ruleId` | DELETE | Delete a custom rule |
| `/api/security/yara/reset-defaults` | POST | Reset built-in rules to defaults |

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

