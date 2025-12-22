# API Reference

Complete reference for MCP Shark's API endpoints and WebSocket protocol.

## Base URL

- **Development**: `http://localhost:9853`
- **Production**: Configure based on your deployment

## Traffic & Monitoring

### GET /api/requests

Retrieve communication requests/responses with optional filtering.

**Query Parameters:**
- `limit` (number): Maximum number of results (default: 5000)
- `search` (string): Full-text search across all fields
- `serverName` (string): Filter by server name
- `sessionId` (string): Filter by session ID
- `method` (string): Filter by HTTP method
- `jsonrpcMethod` (string): Filter by JSON-RPC method
- `statusCode` (number): Filter by HTTP status code
- `jsonrpcId` (string): Filter by JSON-RPC request ID

**Response:**
```json
[
  {
    "id": 1,
    "timestamp_iso": "2024-01-01T00:00:00.000Z",
    "direction": "request",
    "method": "POST",
    "url": "/mcp",
    "server_name": "github",
    "session_id": "abc123",
    "jsonrpc_method": "tools/list",
    "jsonrpc_id": "req-1",
    "status_code": 200,
    "duration_ms": 150,
    "payload": "..."
  }
]
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
    "first_request": "2024-01-01T00:00:00.000Z",
    "last_request": "2024-01-01T00:05:00.000Z",
    "request_count": 10
  }
]
```

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
  "port": 9851,
  "servers": ["github", "filesystem"]
}
```

### GET /api/composite/logs

Get MCP Shark server logs.

**Query Parameters:**
- `limit` (number): Maximum number of log entries
- `type` (string): Filter by log type (stdout, stderr, error)

**Response:**
```json
[
  {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "type": "stdout",
    "message": "Server started on port 9851"
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
  "configPath": "~/.cursor/mcp.json",
  "selectedServers": ["github", "filesystem"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Server started successfully"
}
```

### POST /api/composite/stop

Stop the MCP Shark server.

**Response:**
```json
{
  "success": true,
  "message": "Server stopped successfully"
}
```

### POST /api/composite/logs/clear

Clear server logs.

**Response:**
```json
{
  "success": true,
  "message": "Logs cleared"
}
```

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
  "config": { /* MCP configuration */ }
}
```

**Response:**
```json
{
  "services": [
    {
      "name": "github",
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    }
  ]
}
```

## Playground

### POST /api/playground/proxy

Proxy MCP requests for testing.

**Request Headers:**
- `Content-Type: application/json`
- `Mcp-Session-Id` (optional): Session ID for stateful requests

**Request Body:**
```json
{
  "method": "tools/list",
  "params": {},
  "serverName": "github"
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

## Smart Scan

### POST /api/smartscan/scans

Create a new scan.

**Request Body:**
```json
{
  "servers": ["github", "filesystem"]
}
```

**Response:**
```json
{
  "scanId": "scan-123",
  "status": "processing",
  "servers": ["github", "filesystem"]
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

Discover servers from config.

**Query Parameters:**
- `configPath` (string): Path to configuration file

**Response:**
```json
{
  "servers": [
    {
      "name": "github",
      "type": "stdio"
    }
  ]
}
```

## Settings

### GET /api/settings

Get all application settings and paths.

Includes additional fields for local LLM configuration:
- `paths.llmSettings` and `paths.modelsDirectory`
- `system.memory` (RAM info)
- `llm.settings`, `llm.availableModels`, `llm.recommendedModel`
- `llm.runtime` (local runtime capability flags)

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

### POST /api/settings/llm

Update persisted Local LLM settings.

**Request Body:**
```json
{
  "enabled": true,
  "autoAnalyzeOnDrift": true,
  "modelMode": "auto",
  "modelName": null,
  "threads": null,
  "contextTokens": 2048,
  "maxOutputTokens": 800,
  "cooldownMs": 30000,
  "minRamGb": 8
}
```

**Response:**
```json
{
  "success": true,
  "settings": {
    "enabled": true,
    "autoAnalyzeOnDrift": true
  }
}
```

### POST /api/settings/llm/test

Test loading the selected local model (runs in a short-lived subprocess to avoid permanently consuming RAM).

**Notes:**
- Requires `enabled: true` in Local LLM settings
- May return `400` if your system RAM is below `minRamGb`
- Subject to a cooldown (`cooldownMs`)

**Request Body:**
```json
{
  "modelMode": "auto",
  "modelName": null
}
```

**Response:**
```json
{
  "success": true,
  "message": "Model loaded successfully (Qwen2.5-1.5B-Instruct-Q4_K_M.gguf)"
}
```

## Local LLM Setup

### GET /api/llm/catalog

Get a small catalog of recommended GGUF models (plus their direct download URLs).

**Response:**
```json
{
  "models": [
    {
      "id": "qwen2.5-1.5b-instruct-q4_k_m",
      "name": "Qwen2.5 1.5B Instruct (Q4_K_M)",
      "fileName": "Qwen2.5-1.5B-Instruct-Q4_K_M.gguf",
      "url": "https://…",
      "source": "huggingface",
      "notes": "Small, fast, good default for drift analysis on 8GB+ machines."
    }
  ]
}
```

### POST /api/llm/download

Download a model into `~/.mcp-shark/models` (supports progress + cancel).

**Request Body:**
```json
{
  "url": "https://…/model.gguf",
  "fileName": "model.gguf"
}
```

**Response:**
```json
{
  "success": true,
  "status": {
    "running": true,
    "fileName": "model.gguf",
    "downloadedBytes": 12345,
    "totalBytes": 99999,
    "percent": 12.3
  }
}
```

### GET /api/llm/download/status

Get current download progress.

### POST /api/llm/download/cancel

Cancel the current download.

### GET /api/llm/deps/status

Check whether `node-llama-cpp` is installed and whether an install is currently running.

### POST /api/llm/deps/install

Run `npm install` in the MCP Shark repo to install local LLM dependencies (shows output in the UI).

### POST /api/llm/deps/cancel

Cancel the in-progress dependency install.

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

