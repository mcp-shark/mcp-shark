# Core Architecture

This directory contains the core architecture following SOLID principles with dependency injection.

## Architecture Overview

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

## Principles

1. **Everything exposed as service classes** - All business logic is in service classes
2. **All DB-related code as repositories** - Database access is encapsulated in repositories
3. **Libraries cannot access services or repos** - Libraries are pure utilities with no dependencies
4. **Libraries must be injected** - Dependency injection ensures loose coupling
5. **SOLID principles** - Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion

## Structure

### Repositories (`core/repositories/`)
- `PacketRepository` - Handles all packet/request database operations
- `SessionRepository` - Handles session database operations
- `ConversationRepository` - Handles conversation database operations
- `AuditRepository` - Handles audit logging database operations
- `StatisticsRepository` - Handles statistics database operations

### Services (`core/services/`)
- `RequestService` - Business logic for requests/packets
- `SessionService` - Business logic for sessions
- `ConversationService` - Business logic for conversations
- `StatisticsService` - Business logic for statistics
- `AuditService` - Business logic for audit logging

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
- `StatusCodes` - HTTP status code constants
- `StatusCodeRanges` - Status code ranges for validation

### Container (`core/container/`)
- `DependencyContainer` - Dependency injection container that manages all dependencies

### MCP Server (`core/mcp-server/`)
- `index.js` - Main entry point for starting the MCP Shark server
- `auditor/` - Audit logging for request/response packets
- `server/external/` - External MCP server management
- `server/internal/` - Internal MCP server implementation

### Libraries (`core/libraries/`)
- `LoggerLibrary` - Logging utilities wrapper
- `SerializationLibrary` - BigInt serialization utilities
- `ErrorLibrary` - Error handling utilities (CompositeError, isError, getErrors)

## Usage

### Creating a Container

```javascript
import { DependencyContainer } from '#core';
import { openDb } from '#core/db/init';

const db = openDb(getDatabaseFile());
const container = new DependencyContainer(db);
```

### Using Services in Routes

```javascript
import { DependencyContainer } from '#core';

export function createRequestsRoutes(container) {
  const requestService = container.getService('request');
  const logger = container.getLibrary('logger');

  const router = {};

  router.getRequests = (req, res) => {
    try {
      const requests = requestService.getRequests(req.query);
      res.json(requests);
    } catch (error) {
      logger.error({ error: error.message }, 'Error in getRequests');
      res.status(500).json({ error: 'Failed to query requests', details: error.message });
    }
  };

  return router;
}
```

### Import Paths

All core imports use the `#core` alias defined in `package.json`:
- `#core` - Main entry point (exports DependencyContainer and all core modules)
- `#core/repositories/*` - Repository classes
- `#core/services/*` - Service classes
- `#core/libraries/*` - Library classes
- `#core/container/*` - Container classes

This eliminates the need for relative paths like `../../../core/index.js`.

### Getting Audit Logger

```javascript
const auditLogger = container.getAuditLogger();
// auditLogger.logRequestPacket(options)
// auditLogger.logResponsePacket(options)
```

## Migration Notes

- Old query functions in `lib/common/db/query.js` and `lib/common/db/logger.js` are kept for backward compatibility but should not be used in new code
- All routes now receive a `DependencyContainer` instead of a database instance
- Services handle all business logic and data transformation
- Repositories handle all database queries
- Libraries are injected into services, not accessed directly

