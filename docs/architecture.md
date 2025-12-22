# Architecture

Overview of MCP Shark's system architecture and design.

## System Overview

MCP Shark consists of three main components:

1. **MCP Shark Server** (Port 9851): Aggregation layer that connects to multiple MCP servers
2. **MCP Shark UI** (Port 9853): Web interface for monitoring and management
3. **SQLite Database**: Stores all traffic for audit logging and analysis

## Architecture Diagram

```
┌─────────────┐
│   Your IDE  │
│ (Cursor,    │
│  Windsurf) │
└──────┬──────┘
       │ HTTP
       ▼
┌─────────────────────────────────┐
│   MCP Shark Server               │
│   (Express on port 9851)         │
│                                   │
│  ┌────────────────────────────┐ │
│  │  Internal MCP Server        │ │
│  │  - tools/list               │ │
│  │  - tools/call               │ │
│  │  - prompts/list             │ │
│  │  - prompts/get              │ │
│  │  - resources/list            │ │
│  │  - resources/read            │ │
│  └──────────┬──────────────────┘ │
│             │                     │
│  ┌──────────▼──────────────────┐ │
│  │  Audit Logger (SQLite)      │ │
│  └──────────────────────────────┘ │
└──────────┬────────────────────────┘
           │
           ├──► HTTP MCP Server
           ├──► stdio MCP Server
           └──► stdio MCP Server
```

## Data Flow

1. **Request Flow**: IDE → MCP Shark Server → MCP Servers
2. **Response Flow**: MCP Servers → MCP Shark Server → IDE
3. **Logging**: All traffic is logged to SQLite Database
4. **Monitoring**: UI reads from database and provides real-time updates via WebSocket

## Component Details

### MCP Shark Server

The server component handles:

- **Request Aggregation**: Routes requests to appropriate MCP servers
- **Response Aggregation**: Combines responses from multiple servers
- **Session Management**: Tracks and maintains session state
- **Audit Logging**: Records all communications to SQLite
- **Error Handling**: Manages errors and provides fallback mechanisms

**Port**: 9851

**Protocol**: HTTP/JSON-RPC

### MCP Shark UI

The web interface provides:

- **Real-time Monitoring**: WebSocket-powered live updates
- **Traffic Inspection**: Detailed packet analysis
- **Interactive Playground**: Testing environment for MCP servers
- **Configuration Management**: Server setup and management
- **Security Analysis**: Smart Scan integration

**Port**: 9853

**Protocol**: HTTP/WebSocket

### SQLite Database

Stores all MCP communications with:

- **Request/Response Tracking**: Full payload logging with correlation IDs
- **Performance Metrics**: Duration, latency, and timing information
- **Error Tracking**: Comprehensive error logging with stack traces
- **Session Management**: Session ID tracking for stateful interactions
- **Server Identification**: Track which external server handled each request

**Location**: `~/.mcp-shark/db/mcp-shark.sqlite`

## Project Structure

```
mcp-shark/
├── bin/
│   └── mcp-shark.js          # CLI entry point
├── core/mcp-server/      # MCP server library (core component)
│   ├── index.js              # Library entry point
│   ├── mcp-shark.js          # Server entry point
│   └── lib/
│       ├── server/
│       │   ├── internal/     # Internal MCP server (aggregator)
│       │   │   ├── server.js
│       │   │   ├── run.js
│       │   │   ├── session.js
│       │   │   └── handlers/
│       │   └── external/     # External MCP server clients
│       │       ├── all.js
│       │       ├── config.js
│       │       ├── kv.js
│       │       └── single/
│       └── auditor/
│           └── audit.js
├── ui/
│   ├── server.js             # Express server with WebSocket
│   ├── src/                  # React frontend
│   │   ├── App.jsx
│   │   ├── components/
│   │   └── ...
│   └── vite.config.js
├── lib/common/
│   ├── logger.js             # Unified logger implementation
│   ├── configs/              # Configuration management
│   └── db/                   # Database utilities
└── package.json              # Single package.json for entire project
```

## Configuration Files

Configuration and database files are stored in `~/.mcp-shark/` by default:

- `~/.mcp-shark/mcps.json` - Server configuration
- `~/.mcp-shark/db/mcp-shark.sqlite` - SQLite database
- `~/.mcp-shark/smart-scan-token.json` - Smart Scan API token

## Supported MCP Methods

MCP Shark supports all standard MCP methods:

- **`tools/list`** - List all tools from all servers
- **`tools/call`** - Call a tool from any server (with server prefix: `server:tool_name`)
- **`prompts/list`** - List all prompts from all servers
- **`prompts/get`** - Get a specific prompt
- **`resources/list`** - List all resources from all servers
- **`resources/read`** - Read a specific resource

### Tool Naming Convention

When calling tools, prefix with the server name:

- `github:search_repositories` - Calls `search_repositories` from the `github` server
- `@21st-dev/magic:create_component` - Calls `create_component` from the `@21st-dev/magic` server

## Database Schema

The database includes:

- **`mcp_communications`**: All request/response communications
- **`mcp_request_response_pairs`**: Correlated request/response pairs
- **Sessions**: Automatic session tracking

The database can be accessed directly for advanced analysis or exported through the UI in JSON, CSV, or TXT formats.

## Technology Stack

**MCP Server:**
- Express.js for HTTP server
- Model Context Protocol SDK
- SQLite for audit logging
- Support for HTTP and stdio-based MCP servers

**UI:**
- React 18 for frontend
- Vite for build tooling
- Express.js for backend API
- WebSocket (ws) for real-time updates
- SQLite (better-sqlite3) for database

**Code Quality:**
- Biome for linting and formatting
- Husky for git hooks
- Commitlint for conventional commits

## Security Considerations

- Configuration files are automatically backed up before modification
- Smart Scan token is stored securely in the working directory
- Database access is restricted to the application
- No sensitive data is exposed in the UI without proper authentication

## Performance

- Efficient SQLite storage for audit logs
- WebSocket for real-time updates without polling
- Cached Smart Scan results for quick access
- Optimized React components with memoization
- Lazy loading for large datasets

