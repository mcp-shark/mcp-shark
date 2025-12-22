# Architecture Rules

## Core Principles

### 1. Service Layer Rules (CRITICAL)

**Services MUST:**
- Accept only typed models/objects (not HTTP request objects)
- Return only typed models/objects (not HTTP response objects)
- Have NO knowledge of HTTP (no req, res, status codes, headers, etc.)
- Have NO knowledge of serialization (no BigInt serialization in services)
- Contain only business logic
- Use repositories for data access
- Use injected libraries for utilities

**Services MUST NOT:**
- Accept `req` or `res` objects
- Accept query parameters directly
- Return HTTP-specific formats (CSV, TXT, etc.)
- Handle HTTP status codes
- Handle HTTP headers
- Perform serialization (BigInt to string conversion)
- Sanitize/parse HTTP query parameters
- Format data for HTTP responses

### 2. Controller Layer Rules (CRITICAL)

**Controllers (Routes) MUST:**
- Extract data from HTTP requests (`req.query`, `req.params`, `req.body`)
- Sanitize and validate HTTP input
- Convert HTTP input to typed models
- Call services with typed models
- Convert service results to HTTP responses
- Handle HTTP status codes
- Handle HTTP headers
- Perform serialization (BigInt to string)
- Format data for HTTP (CSV, TXT, JSON, etc.)
- Handle HTTP errors and return appropriate status codes

**Controllers MUST NOT:**
- Access repositories directly
- Access database directly
- Contain business logic
- Call other controllers

### 3. Repository Layer Rules

**Repositories MUST:**
- Accept typed models/objects
- Return raw database results
- Contain only database queries
- Have NO knowledge of HTTP
- Have NO knowledge of business logic

**Repositories MUST NOT:**
- Accept HTTP request objects
- Return HTTP-formatted data
- Contain business logic
- Perform serialization

### 4. Library Layer Rules

**Libraries MUST:**
- Be pure utilities with no dependencies
- Have NO knowledge of services, repositories, or HTTP
- Be injectable via dependency injection

**Libraries MUST NOT:**
- Access services
- Access repositories
- Access HTTP objects
- Have side effects beyond their utility function

## Architecture Flow

```
HTTP Request
    ↓
Controller (Routes)
    ├─ Extract from req.query/params/body
    ├─ Sanitize & Validate
    ├─ Convert to Typed Model
    ↓
Service
    ├─ Business Logic
    ├─ Use Repository
    ├─ Return Typed Model
    ↓
Controller
    ├─ Convert to HTTP Response
    ├─ Serialize (BigInt → string)
    ├─ Format (JSON/CSV/TXT)
    ├─ Set Status Code
    ├─ Set Headers
    ↓
HTTP Response
```

## Examples

### ✅ CORRECT

**Service:**
```javascript
// Service accepts typed model
getRequests(filters) {
  // filters is a typed object, not req.query
  const requests = this.packetRepository.queryRequests(filters);
  return requests; // Returns raw data, no serialization
}
```

**Controller:**
```javascript
router.getRequests = (req, res) => {
  // Extract and sanitize from HTTP
  const filters = new RequestFilters({
    sessionId: req.query.sessionId || null,
    limit: req.query.limit,
  });
  
  // Call service with typed model
  const requests = requestService.getRequests(filters);
  
  // Serialize and format for HTTP
  const serialized = serializationLib.serializeBigInt(requests);
  res.json(serialized);
};
```

### ❌ WRONG

**Service (WRONG):**
```javascript
// ❌ Service accepts req.query directly
getRequests(reqQuery) {
  const filters = this._sanitizeFilters(reqQuery); // ❌ Sanitization in service
  const requests = this.packetRepository.queryRequests(filters);
  return this.serializationLib.serializeBigInt(requests); // ❌ Serialization in service
}

// ❌ Service returns HTTP-formatted data
exportRequests(filters, format) {
  if (format === 'csv') {
    return { content: '...', contentType: 'text/csv' }; // ❌ HTTP formatting in service
  }
}
```

**Controller (WRONG):**
```javascript
router.getRequests = (req, res) => {
  // ❌ Passing req.query directly to service
  const requests = requestService.getRequests(req.query);
  res.json(requests);
};
```

## Model Types

Services should work with typed models. Examples:

```javascript
// RequestFilters model
{
  sessionId: string | null;
  direction: 'request' | 'response' | null;
  method: string | null;
  limit: number;
  offset: number;
  // ... other filter fields
}

// Packet model (from repository)
{
  frame_number: number;
  timestamp_ns: bigint;
  session_id: string | null;
  // ... other packet fields
}

// Statistics model (from service)
{
  total_packets: number;
  total_requests: number;
  total_responses: number;
  total_errors: number;
  unique_sessions: number;
}
```

