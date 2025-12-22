# Architecture

Overview of MCP Shark's system architecture and design.

## System Overview

MCP Shark follows a clean architecture pattern with strict separation of concerns:

```
┌─────────────┐
│ Controllers │  (HTTP handling: extraction, sanitization, serialization)
└──────┬──────┘
       │ uses models
       ▼
┌─────────────┐
│   Models    │  (Typed data structures)
└──────┬──────┘
       │ used by
       ▼
┌─────────────┐
│  Services   │  (Business Logic - HTTP-agnostic)
└──────┬──────┘
       │ uses
       ▼
┌─────────────┐
│Repositories │  (Data Access)
└──────┬──────┘
       │ uses
       ▼
┌─────────────┐
│  Database   │  (SQLite)
└─────────────┘
```

### Main Components

1. **MCP Shark Server** (Port 9851): Aggregation layer that connects to multiple MCP servers
2. **MCP Shark UI** (Port 9853): Web interface for monitoring and management
3. **SQLite Database**: Stores all traffic for audit logging and analysis

## Architecture Principles

- **Service-Oriented Architecture (SOA)**: All business logic is in service classes
- **HTTP-Agnostic Services**: Services accept and return typed models, with no knowledge of HTTP
- **Dependency Injection**: All dependencies are managed through `DependencyContainer`
- **SOLID Principles**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **Clean Code**: No nested functions, all imports at top, file size limits (250 lines max for backend files)

## Core Components

- **Controllers** (`ui/server/controllers/`): Handle HTTP concerns (request parsing, response formatting, error handling)
- **Services** (`core/services/`): Contain all business logic, HTTP-agnostic
- **Repositories** (`core/repositories/`): Encapsulate database access
- **Models** (`core/models/`): Typed data structures for data transfer
- **Libraries** (`core/libraries/`): Pure utility functions with no dependencies
- **Constants** (`core/constants/`): Well-defined constants (no magic numbers)
- **MCP Server** (`core/mcp-server/`): Core MCP server implementation with audit logging

For detailed core architecture documentation, see [Core README](../core/README.md).

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
├── bin/                    # Executable scripts
├── core/                   # Core architecture
│   ├── constants/         # Well-defined constants
│   ├── container/         # Dependency injection
│   ├── libraries/         # Pure utility libraries
│   ├── models/           # Typed data models
│   ├── mcp-server/       # MCP server implementation
│   ├── repositories/     # Data access layer
│   └── services/         # Business logic layer
├── ui/                    # Web UI
│   ├── server/           # Express server and routes
│   └── src/              # React frontend
├── docs/                  # Documentation
├── rules/                 # Architecture and coding rules
└── scripts/               # Build and utility scripts
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

