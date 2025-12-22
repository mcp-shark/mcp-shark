# Database Architecture Rules

## Principle
**All database access must go through repositories with dependency injection. No SQL queries outside repositories.**

## Current Architecture

### ✅ Properly Structured

1. **Repositories** (`core/repositories/`)
   - Database is injected via constructor: `constructor(db)`
   - All SQL queries are encapsulated in repositories
   - Repositories return raw database results
   - Examples: `PacketRepository`, `SessionRepository`, `ConversationRepository`, `AuditRepository`, `StatisticsRepository`

2. **Services** (`core/services/`)
   - Use repositories via dependency injection
   - No direct database access
   - HTTP-agnostic: accept models, return models
   - Examples: `RequestService`, `SessionService`, `AuditService`

3. **Dependency Container** (`core/container/DependencyContainer.js`)
   - Manages all dependencies
   - Injects database into repositories
   - Provides services and repositories to controllers

4. **Database Initialization** (`core/db/init.js`)
   - `initDb(dbPath)` - Creates database instance and initializes schema
   - `openDb(dbPath)` - Opens existing database and ensures schema exists
   - **NO SQL statements** - Uses `SchemaRepository` for schema creation

5. **Schema Repository** (`core/repositories/SchemaRepository.js`)
   - `createSchema()` - Creates all tables and indexes
   - Database is injected via constructor: `constructor(db)`
   - All schema SQL (CREATE TABLE, CREATE INDEX) is encapsulated here

### ✅ Clean Architecture

1. **`core/db/query.js`** - **DELETED** ✅
   - Was dead code (not used)
   - Repositories already have all these queries
   - **Status**: Removed

2. **`core/db/logger.js`** - **DELETED** ✅
   - Was dead code (not used)
   - Replaced by `AuditService` + `AuditRepository` (properly injected)
   - **Status**: Removed

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

## Current Flow

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

### Check for dead code:
```bash
# Check if query.js is used
grep -r "from.*db/query\|import.*db/query" . --include="*.js"

# Check if logger.js is used
grep -r "from.*db/logger\|import.*db/logger\|getLogger(" . --include="*.js"
```

## Status

- ✅ **Repositories**: All use DI correctly
- ✅ **Services**: All use repositories via DI
- ✅ **Database initialization**: Properly isolated
- ✅ **Dead code**: Removed (`core/db/query.js` and `core/db/logger.js` deleted)
- ✅ **Architecture**: 100% compliant - All database access through repositories with DI

## Current Structure

```
core/db/
  └── init.js          (Database initialization - uses SchemaRepository)

core/repositories/
  └── SchemaRepository.js  (Schema creation - all CREATE TABLE/INDEX SQL)
```

---

**Last Updated**: 2025-12-22

