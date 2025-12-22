# UI Endpoint Compliance Checklist

## Overview
This checklist ensures that UI endpoints (routes/controllers) follow the architecture principles and interoperability guidelines. UI endpoints should **ONLY** call services and handle HTTP concerns (request parsing, response formatting, error handling), with **NO business logic**.

## Architecture Principle
**Routes → Services → Repositories → Database**

UI endpoints are the **entry point** and should be **thin** - they only:
1. Parse HTTP requests (query params, body, headers)
2. Call services with well-defined models
3. Format service responses into HTTP responses
4. Handle HTTP-specific errors

## Compliance Checklist

### ✅ Core Traffic Routes (COMPLIANT)
These routes use controllers that properly call services:

- [x] **`/api/requests`** - Uses `RequestController` → `RequestService`
- [x] **`/api/sessions`** - Uses `SessionController` → `SessionService`
- [x] **`/api/conversations`** - Uses `ConversationController` → `ConversationService`
- [x] **`/api/statistics`** - Uses `StatisticsController` → `StatisticsService`

**Status**: ✅ **COMPLIANT** - These routes properly delegate to services via controllers.

---

### ❌ Routes with Business Logic (NON-COMPLIANT)
These routes contain business logic that should be moved to services:

#### 1. **Config Routes** (`ui/server/routes/config.js`)
**Issues:**
- [ ] File reading logic (`readFileContent`) - should be in `ConfigService`
- [ ] JSON parsing logic (`parseJsonSafely`, `tryParseJson`) - should be in `ConfigService`
- [ ] Path resolution logic (`~` expansion) - should be in `ConfigService`
- [ ] Service extraction logic (`extractServices`) - should be in `ConfigService`
- [ ] Config detection logic (platform-specific paths) - should be in `ConfigService`

**Required Actions:**
- Create `ConfigService` with methods:
  - `readConfigFile(filePath)` - handles path resolution and file reading
  - `parseConfig(content)` - handles JSON parsing
  - `extractServices(config)` - extracts services from config
  - `detectConfigFiles()` - detects config files on system
- Update `ConfigController` to call `ConfigService` methods

#### 2. **Composite Setup Route** (`ui/server/routes/composite/setup.js`)
**Issues:**
- [ ] Config conversion logic (`convertMcpServersToServers`) - should be in `ConfigService`
- [ ] Server filtering logic (`filterServers`) - should be in `ConfigService`
- [ ] File writing logic (`fs.writeFileSync`) - should be in `ConfigService`
- [ ] Server startup logic (`startMcpSharkServer`) - should be in `ServerManagementService`
- [ ] Config backup logic (`updateConfigFile`) - should be in `ConfigService`
- [ ] Log management logic (`mcpSharkLogs`, `broadcastLogUpdate`) - should be in `LogService`

**Required Actions:**
- Create `ServerManagementService` with methods:
  - `startServer(configPath, options)` - handles server startup
  - `stopServer(process)` - handles server shutdown
  - `getServerStatus(process)` - gets server status
- Move config operations to `ConfigService`
- Move log operations to `LogService`
- Update `SetupController` to orchestrate these services

#### 3. **Smart Scan Discover Route** (`ui/server/routes/smartscan/discover.js`)
**Issues:**
- [ ] MCP client connection logic (`discoverServer`) - should be in `McpDiscoveryService`
- [ ] Server discovery orchestration - should be in `McpDiscoveryService`
- [ ] Config reading and parsing - should use `ConfigService`

**Required Actions:**
- Create `McpDiscoveryService` with methods:
  - `discoverServer(serverName, serverConfig)` - discovers single server
  - `discoverAllServers(config)` - discovers all servers from config
- Update `DiscoverController` to call `McpDiscoveryService`

#### 4. **Smart Scan Routes** (`ui/server/routes/smartscan/scans/*.js`)
**Issues:**
- [ ] Scan creation logic (`createScan`, `createBatchScans`) - should be in `ScanService`
- [ ] Cache management logic (`getCachedScanResult`, `storeScanResult`) - should be in `ScanCacheService`
- [ ] Hash computation (`computeMcpHash`) - should be in `ScanService`
- [ ] External API calls (`fetch` to Smart Scan API) - should be in `ScanService`

**Required Actions:**
- Create `ScanService` with methods:
  - `createScan(scanData, apiToken)` - creates scan via API
  - `createBatchScans(servers, apiToken)` - creates batch scans
  - `getScan(scanId, apiToken)` - gets scan by ID
- Create `ScanCacheService` with methods:
  - `getCachedResult(hash)` - gets cached scan result
  - `storeResult(serverName, hash, data)` - stores scan result
  - `clearCache()` - clears all cached results
  - `getAllCachedResults()` - gets all cached results
- Update `ScanController` to call these services

#### 5. **Playground Route** (`ui/server/routes/playground.js`)
**Issues:**
- [ ] MCP client connection management (`getClient`, `clientSessions`) - should be in `McpClientService`
- [ ] Method routing logic (`executeMethod` switch statement) - should be in `McpClientService`
- [ ] Session management - should be in `McpClientService`

**Required Actions:**
- Create `McpClientService` with methods:
  - `getOrCreateClient(serverName, sessionId)` - manages client connections
  - `executeMethod(client, method, params)` - executes MCP methods
  - `closeClient(serverName, sessionId)` - closes client connections
  - `cleanupSession(sessionId)` - cleans up session
- Update `PlaygroundController` to call `McpClientService`

#### 6. **Backup Routes** (`ui/server/routes/backups/*.js`)
**Issues:**
- [ ] File operations (`readFileSync`, `writeFileSync`, `unlinkSync`) - should be in `BackupService`
- [ ] Path resolution and validation - should be in `BackupService`
- [ ] Backup listing logic - should be in `BackupService`

**Required Actions:**
- Create `BackupService` with methods:
  - `listBackups()` - lists all backups
  - `createBackup(originalPath, content)` - creates backup
  - `restoreBackup(backupPath, originalPath)` - restores from backup
  - `viewBackup(backupPath)` - views backup content
  - `deleteBackup(backupPath)` - deletes backup
- Update `BackupController` to call `BackupService`

#### 7. **Settings Route** (`ui/server/routes/settings.js`)
**Issues:**
- [ ] File system operations - should be in `SettingsService`
- [ ] Config reading - should use `ConfigService`

**Required Actions:**
- Create `SettingsService` with methods:
  - `getSettings()` - gets application settings
  - `updateSettings(settings)` - updates settings
- Update `SettingsController` to call `SettingsService`

#### 8. **Logs Route** (`ui/server/routes/logs.js`)
**Issues:**
- [ ] Log array management (`mcpSharkLogs`) - should be in `LogService`
- [ ] Log export formatting - should be in `LogService`

**Required Actions:**
- Create `LogService` with methods:
  - `getLogs(filters)` - gets logs with filters
  - `clearLogs()` - clears logs
  - `exportLogs(format)` - exports logs in specified format
- Update `LogsController` to call `LogService`

---

## WSO2 API Manager Interoperability Principles

Based on key concepts for interoperability and integrations:

### ✅ Checklist for Interoperability

#### 1. **API Gateway Pattern**
- [x] Routes act as API gateway (entry point)
- [ ] Services are properly abstracted behind routes
- [ ] No direct database access from routes
- [ ] Consistent error handling across all endpoints

#### 2. **Service Abstraction**
- [ ] All business logic is in services (not routes)
- [ ] Services are reusable across different entry points
- [ ] Services are testable independently
- [ ] Services have clear interfaces (models in/out)

#### 3. **Integration Patterns**
- [ ] External API calls are in services (not routes)
- [ ] File system operations are in services (not routes)
- [ ] Configuration management is in services (not routes)
- [ ] Caching logic is in services (not routes)

#### 4. **Data Transformation**
- [x] HTTP request → Model transformation in controllers
- [x] Model → HTTP response transformation in controllers
- [ ] Business data transformation in services (not routes)

#### 5. **Error Handling**
- [x] HTTP error formatting in controllers
- [ ] Business error handling in services
- [ ] Consistent error response format

#### 6. **Security & Validation**
- [ ] Input validation in controllers (HTTP layer)
- [ ] Business validation in services
- [ ] Authentication/authorization in services

#### 7. **Monitoring & Observability**
- [ ] Logging in services (business events)
- [ ] Request/response logging in controllers (HTTP layer)
- [ ] Metrics collection in services

---

## Refactoring Priority

### High Priority (Core Functionality)
1. **Config Routes** - Used by setup flow
2. **Composite Setup Route** - Critical for server management
3. **Backup Routes** - Data integrity operations

### Medium Priority (Feature Functionality)
4. **Smart Scan Routes** - Feature-specific
5. **Playground Route** - Feature-specific
6. **Settings Route** - Configuration management

### Low Priority (Auxiliary)
7. **Logs Route** - Logging/observability
8. **Help Route** - UI state management

---

## Implementation Guidelines

### When Creating a New Service:

1. **Service Location**: `core/services/ServiceName.js`
2. **Service Registration**: Add to `DependencyContainer`
3. **Service Interface**: Accept models, return models (no HTTP)
4. **Controller Creation**: `ui/server/controllers/ServiceNameController.js`
5. **Route Update**: Use controller in route

### Example Pattern:

```javascript
// ❌ BAD - Business logic in route
router.getData = (req, res) => {
  const file = fs.readFileSync('data.json');
  const parsed = JSON.parse(file);
  const filtered = parsed.filter(item => item.active);
  res.json(filtered);
};

// ✅ GOOD - Business logic in service
// Service: DataService.getActiveItems()
router.getData = (req, res) => {
  const items = dataService.getActiveItems();
  res.json(items);
};
```

---

## Verification Commands

Run these checks to verify compliance:

```bash
# Check for direct file system access in routes
grep -r "fs\." ui/server/routes/ | grep -v "node:fs"

# Check for direct database access in routes
grep -r "db\." ui/server/routes/

# Check for business logic patterns in routes
grep -r "JSON.parse\|JSON.stringify" ui/server/routes/
grep -r "\.filter\|\.map\|\.reduce" ui/server/routes/

# Check for service calls (should be present)
grep -r "container\.getService\|Service" ui/server/routes/
```

---

## Status Summary

- **Compliant Routes**: 4 (requests, sessions, conversations, statistics)
- **Non-Compliant Routes**: 8+ (config, setup, smartscan, playground, backups, settings, logs, help)
- **Total Routes**: 12+

**Compliance Rate**: ~33% (4/12)

**Next Steps**: Refactor non-compliant routes to use services following the established pattern.

