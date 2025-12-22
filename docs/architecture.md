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

┌─────────────┐
│  Libraries  │  (Pure Utilities - No dependencies)
└─────────────┘
       ▲
       │ injected into
       │
┌─────────────┐
│  Services   │
└─────────────┘

┌─────────────┐
│ Constants   │  (Well-defined constants, no magic numbers)
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

## Core Architecture Principles

1. **Everything exposed as service classes** - All business logic is in service classes
2. **All DB-related code as repositories** - Database access is encapsulated in repositories
3. **Libraries cannot access services or repos** - Libraries are pure utilities with no dependencies
4. **Libraries must be injected** - Dependency injection ensures loose coupling
5. **SOLID principles** - Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion

## Core Structure

### Repositories (`core/repositories/`)
- `PacketRepository` - Handles all packet/request database operations
- `SessionRepository` - Handles session database operations
- `ConversationRepository` - Handles conversation database operations
- `AuditRepository` - Handles audit logging database operations
- `StatisticsRepository` - Handles statistics database operations
- `SchemaRepository` - Handles database schema creation

### Services (`core/services/`)
- `RequestService` - Business logic for requests/packets
- `SessionService` - Business logic for sessions
- `ConversationService` - Business logic for conversations
- `StatisticsService` - Business logic for statistics
- `AuditService` - Business logic for audit logging
- `ConfigService` - Configuration management (composed of ConfigFileService, ConfigTransformService, ConfigDetectionService)
- `BackupService` - Backup management
- `ScanCacheService` - Smart Scan cache management
- `TokenService` - Smart Scan token management
- `SettingsService` - Application settings

### Libraries (`core/libraries/`)
- `SerializationLibrary` - BigInt serialization utilities
- `LoggerLibrary` - Logging utilities wrapper
- `ErrorLibrary` - Error handling utilities (CompositeError, isError, getErrors)

### Models (`core/models/`)
- `RequestFilters` - Typed model for request filtering
- `SessionFilters` - Typed model for session filtering
- `ConversationFilters` - Typed model for conversation filtering
- `ExportFormat` - Export format constants

### Constants (`core/constants/`)
- `Defaults` - Default values (limits, offsets, etc.)
- `HttpStatus` - HTTP status code constants
- `StatusCodes` - Status code constants

### Container (`core/container/`)
- `DependencyContainer` - Dependency injection container that manages all dependencies

### MCP Server (`core/mcp-server/`)
- `index.js` - Main entry point for starting the MCP Shark server
- `auditor/` - Audit logging for request/response packets
- `server/external/` - External MCP server management
- `server/internal/` - Internal MCP server implementation

## Usage Examples

### Creating a Container

```javascript
import { DependencyContainer } from '#core';
import { openDb } from '#core/db/init';
import { getDatabaseFile } from '#core/configs';

const db = openDb(getDatabaseFile());
const container = new DependencyContainer(db);
```

### Using Services in Controllers

```javascript
import { DependencyContainer } from '#core';

export function createRequestsController(container) {
  const requestService = container.getService('request');
  const logger = container.getLibrary('logger');

  return {
    getRequests: (req, res) => {
      try {
        const requests = requestService.getRequests(req.query);
        res.json(requests);
      } catch (error) {
        logger.error({ error: error.message }, 'Error in getRequests');
        res.status(500).json({ error: 'Failed to query requests', details: error.message });
      }
    }
  };
}
```

### Getting Audit Logger

```javascript
const auditLogger = container.getAuditLogger();
// auditLogger.logRequestPacket(options)
// auditLogger.logResponsePacket(options)
```

## Import Paths

All core imports use the `#core` alias defined in `package.json`:
- `#core` - Main entry point (exports DependencyContainer and all core modules)
- `#core/repositories/*` - Repository classes
- `#core/services/*` - Service classes
- `#core/libraries/*` - Library classes
- `#core/container/*` - Container classes
- `#core/models/*` - Model classes
- `#core/constants/*` - Constant definitions
- `#core/db/init` - Database initialization
- `#core/configs` - Configuration utilities

This eliminates the need for relative paths like `../../../core/index.js`.

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

