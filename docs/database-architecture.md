# Database Architecture

MCP Shark uses SQLite with a strict repository pattern for all database access.

## Architecture Principles

- **Repository Pattern**: All database access goes through repositories with dependency injection
- **No SQL Outside Repositories**: All SQL queries (SELECT, INSERT, UPDATE, DELETE) are encapsulated in repositories
- **Schema Management**: All schema creation (CREATE TABLE, CREATE INDEX) is handled by `SchemaRepository`
- **Dependency Injection**: Database instance is injected into repositories via `DependencyContainer`

## Database Flow

```
Database Initialization:
  core/db/init.js
    └─> openDb() / initDb()
        └─> Creates Database instance
            └─> Creates SchemaRepository (inject db)
                └─> SchemaRepository.createSchema() (creates tables/indexes)

Dependency Injection:
  DependencyContainer(db)
    └─> Creates Repositories (inject db)
        └─> Creates Services (inject repositories)
            └─> Controllers use Services

Data Access:
  Controller
    └─> Service (business logic)
        └─> Repository (SQL queries)
            └─> Database (injected)
```

## Key Components

### Database Initialization (`core/db/init.js`)

- **`initDb(dbConnectionString)`**: Creates database instance and initializes schema
- **`openDb(dbPath)`**: Opens existing database and ensures schema exists
- **NO SQL statements** - Uses `SchemaRepository` for schema creation
- Uses `ensureDirectoryExists()` from `core/configs` for directory creation

### Schema Repository (`core/repositories/SchemaRepository.js`)

- **`createSchema()`**: Creates all tables and indexes
- Database is injected via constructor: `constructor(db)`
- All schema SQL (CREATE TABLE, CREATE INDEX) is encapsulated here

### Repositories (`core/repositories/`)

All data access queries are in repositories:
- **`PacketRepository`**: Packet capture and retrieval
- **`SessionRepository`**: Session management
- **`ConversationRepository`**: Conversation tracking
- **`AuditRepository`**: Audit logging
- **`StatisticsRepository`**: Statistics and analytics

All repositories:
- Receive database via constructor: `constructor(db)`
- Encapsulate all SQL queries
- Return raw database results

## Rules

### ✅ Allowed

- **Database initialization** in `core/db/init.js`:
  - `initDb()` - Create database instance
  - `openDb()` - Open database instance
  - Uses `SchemaRepository` to create schema (no SQL in init.js)

- **Schema Repository** (`core/repositories/SchemaRepository.js`):
  - `createSchema()` - Creates all tables and indexes
  - All schema SQL (CREATE TABLE, CREATE INDEX) is here
  - Database injected via constructor

- **Repository methods**:
  - All SQL queries (SELECT, INSERT, UPDATE, DELETE)
  - Database operations using injected `this.db`

### ❌ NOT Allowed

- **SQL queries outside repositories**:
  - No queries in services
  - No queries in controllers
  - No queries in utilities
  - No standalone query functions

- **Direct database access**:
  - No `new Database()` outside `core/db/init.js`
  - No `db.prepare()`, `db.run()`, `db.get()`, `db.all()` outside repositories
  - No passing `db` as parameter to non-repository functions

## Database Location

**Default Location:**
- `~/.mcp-shark/db/mcp-shark.sqlite`

**Database Management:**
- Database is created automatically on first run
- Directory is created automatically if it doesn't exist
- All traffic is logged to the database
- Database can be accessed directly for advanced analysis
- Export data through the UI in JSON, CSV, or TXT formats

## Database Schema

The database includes the following tables:

- **`packets`**: All request/response packets with full metadata
- **`conversations`**: Correlated request/response pairs
- **`sessions`**: Session tracking and management

All schema creation is handled by `SchemaRepository.createSchema()`. See [Database Architecture Rules](../rules/DB_ARCHITECTURE.md) for detailed schema information.

## Usage Example

```javascript
import { DependencyContainer } from '#core';
import { openDb } from '#core/db/init';
import { getDatabaseFile } from '#core/configs';

// Initialize database
const db = openDb(getDatabaseFile());

// Create dependency container
const container = new DependencyContainer(db);

// Get repository via service
const requestService = container.getService('request');
const requests = requestService.getRequests({ limit: 10 });
```

## Verification

### Check for SQL queries outside repositories:
```bash
# Find SQL queries in services
grep -r "\.prepare\|\.run\|\.get\|\.all\|SELECT\|INSERT\|UPDATE\|DELETE" core/services/ --include="*.js"

# Find SQL queries in controllers
grep -r "\.prepare\|\.run\|\.get\|\.all\|SELECT\|INSERT\|UPDATE\|DELETE" ui/server/ --include="*.js"

# Find direct database instantiation
grep -r "new Database\|Database(" . --include="*.js" | grep -v "core/db/init.js"
```

## Related Documentation

- **[Database Architecture Rules](../rules/DB_ARCHITECTURE.md)** - Detailed database architecture rules and verification
- **[Architecture Guide](architecture.md)** - System architecture overview

