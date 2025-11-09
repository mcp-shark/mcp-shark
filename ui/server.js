import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import Database from 'better-sqlite3';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'url';
import * as fs from 'node:fs';
import { spawn } from 'node:child_process';
import { homedir } from 'node:os';
import { createConnection } from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Query functions for requests/responses table (inline implementation)
function queryRequests(db, filters = {}) {
  const {
    sessionId = null,
    direction = null,
    method = null,
    jsonrpcMethod = null,
    statusCode = null,
    startTime = null,
    endTime = null,
    jsonrpcId = null,
    search = null, // General search across multiple fields
    serverName = null, // MCP server name filter
    limit = 1000,
    offset = 0,
  } = filters;

  const queryParts = ['SELECT * FROM packets WHERE 1=1'];
  const params = [];

  // General search - searches across multiple fields with partial matching
  // Also searches for server names in JSON-RPC params (e.g., "params":{"name":"server-name.tool")
  if (search) {
    const searchPattern = `%${search}%`;
    // Also create a pattern to search for server name in params (e.g., "name":"server-name")
    const serverNamePattern = `%"name":"${search}%`;
    queryParts.push(`AND (
      session_id LIKE ? ESCAPE '\\' OR
      method LIKE ? ESCAPE '\\' OR
      url LIKE ? ESCAPE '\\' OR
      jsonrpc_method LIKE ? ESCAPE '\\' OR
      jsonrpc_id LIKE ? ESCAPE '\\' OR
      info LIKE ? ESCAPE '\\' OR
      body_raw LIKE ? ESCAPE '\\' OR
      body_json LIKE ? ESCAPE '\\' OR
      headers_json LIKE ? ESCAPE '\\' OR
      host LIKE ? ESCAPE '\\' OR
      remote_address LIKE ? ESCAPE '\\' OR
      -- Search for server name in JSON-RPC params (e.g., "params":{"name":"server-name.tool")
      body_json LIKE ? ESCAPE '\\' OR
      body_raw LIKE ? ESCAPE '\\'
    )`);
    // Add the pattern for each field (12 fields total)
    for (let i = 0; i < 10; i++) {
      params.push(searchPattern);
    }
    // Add server name specific patterns
    params.push(serverNamePattern);
    params.push(serverNamePattern);
  }

  // Specific field filters with partial matching
  if (sessionId) {
    queryParts.push("AND session_id LIKE ? ESCAPE '\\'");
    params.push(`%${sessionId}%`);
  }
  if (direction) {
    queryParts.push('AND direction = ?');
    params.push(direction);
  }
  if (method) {
    queryParts.push("AND method LIKE ? ESCAPE '\\'");
    params.push(`%${method}%`);
  }
  if (jsonrpcMethod) {
    queryParts.push("AND jsonrpc_method LIKE ? ESCAPE '\\'");
    params.push(`%${jsonrpcMethod}%`);
  }
  if (statusCode !== null && statusCode !== undefined) {
    queryParts.push('AND status_code = ?');
    params.push(statusCode);
  }
  if (startTime) {
    queryParts.push('AND timestamp_ns >= ?');
    params.push(startTime);
  }
  if (endTime) {
    queryParts.push('AND timestamp_ns <= ?');
    params.push(endTime);
  }
  if (jsonrpcId) {
    queryParts.push("AND jsonrpc_id LIKE ? ESCAPE '\\'");
    params.push(`%${jsonrpcId}%`);
  }

  // Filter by MCP server name - search in JSON-RPC params
  // Server names appear as "params":{"name":"server-name.tool-name" or "name":"server-name.tool-name"
  if (serverName) {
    const serverPattern = `%"name":"${serverName}.%`;
    const serverPattern2 = `%"name":"${serverName}"%`;
    queryParts.push(`AND (
      body_json LIKE ? ESCAPE '\\' OR
      body_raw LIKE ? ESCAPE '\\' OR
      body_json LIKE ? ESCAPE '\\' OR
      body_raw LIKE ? ESCAPE '\\'
    )`);
    params.push(serverPattern);
    params.push(serverPattern);
    params.push(serverPattern2);
    params.push(serverPattern2);
  }

  queryParts.push('ORDER BY timestamp_ns DESC LIMIT ? OFFSET ?');
  params.push(limit, offset);

  const query = queryParts.join(' ');
  const stmt = db.prepare(query);
  return stmt.all(...params);
}

function queryConversations(db, filters = {}) {
  const {
    sessionId = null,
    method = null,
    status = null,
    startTime = null,
    endTime = null,
    jsonrpcId = null,
    limit = 1000,
    offset = 0,
  } = filters;

  const queryParts = [
    'SELECT',
    '  c.*,',
    '  req.frame_number as req_frame,',
    '  req.timestamp_iso as req_timestamp_iso,',
    '  req.method as req_method,',
    '  req.url as req_url,',
    '  req.jsonrpc_method as req_jsonrpc_method,',
    '  req.body_json as req_body_json,',
    '  req.headers_json as req_headers_json,',
    '  resp.frame_number as resp_frame,',
    '  resp.timestamp_iso as resp_timestamp_iso,',
    '  resp.status_code as resp_status_code,',
    '  resp.jsonrpc_method as resp_jsonrpc_method,',
    '  resp.body_json as resp_body_json,',
    '  resp.headers_json as resp_headers_json,',
    '  resp.jsonrpc_result as resp_jsonrpc_result,',
    '  resp.jsonrpc_error as resp_jsonrpc_error',
    'FROM conversations c',
    'LEFT JOIN packets req ON c.request_frame_number = req.frame_number',
    'LEFT JOIN packets resp ON c.response_frame_number = resp.frame_number',
    'WHERE 1=1',
  ];

  const params = [];

  if (sessionId) {
    queryParts.push('AND c.session_id = ?');
    params.push(sessionId);
  }
  if (method) {
    queryParts.push('AND c.method = ?');
    params.push(method);
  }
  if (status) {
    queryParts.push('AND c.status = ?');
    params.push(status);
  }
  if (startTime) {
    queryParts.push('AND c.request_timestamp_ns >= ?');
    params.push(startTime);
  }
  if (endTime) {
    queryParts.push('AND c.request_timestamp_ns <= ?');
    params.push(endTime);
  }
  if (jsonrpcId) {
    queryParts.push('AND c.jsonrpc_id = ?');
    params.push(jsonrpcId);
  }

  queryParts.push('ORDER BY c.request_timestamp_ns ASC LIMIT ? OFFSET ?');
  params.push(limit, offset);

  const query = queryParts.join(' ');
  const stmt = db.prepare(query);
  return stmt.all(...params);
}

function getSessionRequests(db, sessionId, limit = 10000) {
  const stmt = db.prepare(`
    SELECT * FROM packets
    WHERE session_id = ?
    ORDER BY timestamp_ns DESC
    LIMIT ?
  `);
  return stmt.all(sessionId, limit);
}

// Legacy function name for backward compatibility
const getSessionPackets = getSessionRequests;

function getSessions(db, filters = {}) {
  const { startTime = null, endTime = null, limit = 1000, offset = 0 } = filters;

  const queryParts = ['SELECT * FROM sessions WHERE 1=1'];
  const params = [];

  if (startTime) {
    queryParts.push('AND first_seen_ns >= ?');
    params.push(startTime);
  }
  if (endTime) {
    queryParts.push('AND last_seen_ns <= ?');
    params.push(endTime);
  }

  queryParts.push('ORDER BY first_seen_ns DESC LIMIT ? OFFSET ?');
  params.push(limit, offset);

  const query = queryParts.join(' ');
  const stmt = db.prepare(query);
  return stmt.all(...params);
}

function getStatistics(db, filters = {}) {
  const { sessionId = null, startTime = null, endTime = null } = filters;

  const whereParts = ['WHERE 1=1'];
  const params = [];

  if (sessionId) {
    whereParts.push('AND session_id = ?');
    params.push(sessionId);
  }
  if (startTime) {
    whereParts.push('AND timestamp_ns >= ?');
    params.push(startTime);
  }
  if (endTime) {
    whereParts.push('AND timestamp_ns <= ?');
    params.push(endTime);
  }

  const whereClause = whereParts.join(' ');
  const statsQuery = `
    SELECT 
      COUNT(*) as total_packets,
      COUNT(CASE WHEN direction = 'request' THEN 1 END) as total_requests,
      COUNT(CASE WHEN direction = 'response' THEN 1 END) as total_responses,
      COUNT(CASE WHEN status_code >= 400 THEN 1 END) as total_errors,
      COUNT(DISTINCT session_id) as unique_sessions,
      AVG(length) as avg_packet_size,
      SUM(length) as total_bytes,
      MIN(timestamp_ns) as first_packet_ns,
      MAX(timestamp_ns) as last_packet_ns
    FROM packets
    ${whereClause}
  `;

  const stmt = db.prepare(statsQuery);
  return stmt.get(...params);
}

function createTables(db) {
  db.exec(`
    -- HTTP request/response capture table
    -- Each HTTP request/response is stored for forensic analysis
    CREATE TABLE IF NOT EXISTS packets (
      frame_number INTEGER PRIMARY KEY AUTOINCREMENT,
      
      -- Timestamps (nanosecond precision)
      timestamp_ns INTEGER NOT NULL,  -- Unix timestamp in nanoseconds
      timestamp_iso TEXT NOT NULL,    -- ISO 8601 formatted timestamp for readability
      
      -- Request/Response direction and protocol
      direction TEXT NOT NULL CHECK(direction IN ('request', 'response')),
      protocol TEXT NOT NULL DEFAULT 'HTTP',
      
      -- Session identification (normalized from various header formats)
      session_id TEXT,                -- Normalized session ID (from mcp-session-id, Mcp-Session-Id, or X-MCP-Session-Id)
      
      -- HTTP metadata
      method TEXT,                    -- HTTP method (GET, POST, etc.)
      url TEXT,                       -- Request URL/path
      status_code INTEGER,            -- HTTP status code (for responses)
      
      -- Headers and body
      headers_json TEXT NOT NULL,     -- Full HTTP headers as JSON
      body_raw TEXT,                  -- Raw body content
      body_json TEXT,                 -- Parsed JSON body (if applicable)
      
      -- JSON-RPC metadata (for correlation)
      jsonrpc_id TEXT,                -- JSON-RPC request ID
      jsonrpc_method TEXT,           -- JSON-RPC method (e.g., 'tools/list', 'tools/call')
      jsonrpc_result TEXT,           -- JSON-RPC result (for responses, as JSON string)
      jsonrpc_error TEXT,            -- JSON-RPC error (for error responses, as JSON string)
      
      -- Request/Response metadata
      length INTEGER NOT NULL,        -- Total request/response size in bytes
      info TEXT,                      -- Summary info for quick viewing
      
      -- Network metadata
      user_agent TEXT,                -- User agent string
      remote_address TEXT,            -- Remote IP address
      host TEXT                       -- Host header value
    );

    -- Conversations table - correlates request/response pairs
    CREATE TABLE IF NOT EXISTS conversations (
      conversation_id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_frame_number INTEGER NOT NULL,
      response_frame_number INTEGER,
      session_id TEXT,
      jsonrpc_id TEXT,
      method TEXT,
      request_timestamp_ns INTEGER NOT NULL,
      response_timestamp_ns INTEGER,
      duration_ms REAL,               -- Round-trip time in milliseconds
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'timeout', 'error')),

      FOREIGN KEY (request_frame_number) REFERENCES packets(frame_number),
      FOREIGN KEY (response_frame_number) REFERENCES packets(frame_number)
    );

    -- Sessions table - tracks session metadata
    CREATE TABLE IF NOT EXISTS sessions (
      session_id TEXT PRIMARY KEY,
      first_seen_ns INTEGER NOT NULL,
      last_seen_ns INTEGER NOT NULL,
      packet_count INTEGER DEFAULT 0,
      user_agent TEXT,
      remote_address TEXT,
      host TEXT
    );

    -- Create indexes for forensic analysis
    CREATE INDEX IF NOT EXISTS idx_packets_timestamp ON packets(timestamp_ns);
    CREATE INDEX IF NOT EXISTS idx_packets_session ON packets(session_id);
    CREATE INDEX IF NOT EXISTS idx_packets_direction ON packets(direction);
    CREATE INDEX IF NOT EXISTS idx_packets_jsonrpc_id ON packets(jsonrpc_id);
    CREATE INDEX IF NOT EXISTS idx_packets_jsonrpc_method ON packets(jsonrpc_method);
    CREATE INDEX IF NOT EXISTS idx_packets_method ON packets(method);
    CREATE INDEX IF NOT EXISTS idx_packets_status_code ON packets(status_code);
    CREATE INDEX IF NOT EXISTS idx_packets_session_timestamp ON packets(session_id, timestamp_ns);
    
    CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_jsonrpc_id ON conversations(jsonrpc_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_request_frame ON conversations(request_frame_number);
    CREATE INDEX IF NOT EXISTS idx_conversations_response_frame ON conversations(response_frame_number);
    CREATE INDEX IF NOT EXISTS idx_conversations_timestamp ON conversations(request_timestamp_ns);
    
    CREATE INDEX IF NOT EXISTS idx_sessions_first_seen ON sessions(first_seen_ns);
    CREATE INDEX IF NOT EXISTS idx_sessions_last_seen ON sessions(last_seen_ns);
  `);
}

function openDb(dbPath) {
  // Ensure the directory exists
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log(`Created database directory: ${dbDir}`);
  }

  // Check if database file exists
  const dbExists = fs.existsSync(dbPath);

  // Open or create the database
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Create tables if database is new or tables don't exist
  if (!dbExists) {
    console.log(`Creating new database at: ${dbPath}`);
    createTables(db);
  } else {
    // Even if database exists, ensure tables exist (in case schema changed)
    createTables(db);
  }

  return db;
}

// Store mcp-shark server process globally
let mcpSharkProcess = null;
// Store mcp-shark server logs
let mcpSharkLogs = [];
const MAX_LOG_LINES = 10000; // Keep last 10k lines

// Store original config for restoration
let originalConfigData = null; // { filePath, originalContent, backupPath }

// Function to restore original config file
function restoreOriginalConfig() {
  if (originalConfigData && originalConfigData.filePath) {
    try {
      if (fs.existsSync(originalConfigData.filePath)) {
        // Restore original content
        fs.writeFileSync(originalConfigData.filePath, originalConfigData.originalContent);
        console.log(`Restored original config to: ${originalConfigData.filePath}`);

        // Optionally remove backup file
        if (originalConfigData.backupPath && fs.existsSync(originalConfigData.backupPath)) {
          // Keep backup for safety, but could remove it: fs.unlinkSync(originalConfigData.backupPath);
        }
      }
      originalConfigData = null;
    } catch (error) {
      console.error('Failed to restore original config:', error);
    }
  }
}

// Helper to serialize BigInt values for JSON
function serializeBigInt(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = serializeBigInt(value);
    }
    return result;
  }
  return obj;
}

// Helper to check if a port is listening
function checkPortReady(port, host = 'localhost', timeout = 10000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const tryConnect = () => {
      const socket = createConnection(port, host);

      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });

      socket.on('error', (err) => {
        socket.destroy();
        const elapsed = Date.now() - startTime;
        if (elapsed >= timeout) {
          reject(new Error(`Port ${port} not ready after ${timeout}ms`));
        } else {
          // Retry after a short delay
          setTimeout(tryConnect, 200);
        }
      });
    };

    tryConnect();
  });
}

// Function to find mcp-server path (shared utility)
function findMcpServerPath() {
  let mcpServerPath = path.join(process.cwd(), '../mcp-server');

  if (!fs.existsSync(mcpServerPath)) {
    mcpServerPath = path.join(__dirname, '../mcp-server');
  }

  if (!fs.existsSync(mcpServerPath)) {
    const possiblePaths = [
      path.join(process.cwd(), 'mcp-server'),
      path.join(__dirname, 'mcp-server'),
    ];
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        mcpServerPath = possiblePath;
        break;
      }
    }
  }

  return mcpServerPath;
}

export function createUIServer(db) {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  app.use(express.json());

  // Get requests/responses (Wireshark-like traffic list)
  app.get('/api/requests', (req, res) => {
    const limit = parseInt(req.query.limit) || 1000;
    const offset = parseInt(req.query.offset) || 0;
    const filters = {
      sessionId: req.query.sessionId || null,
      direction: req.query.direction || null,
      method: req.query.method || null,
      jsonrpcMethod: req.query.jsonrpcMethod || null,
      statusCode: req.query.statusCode ? parseInt(req.query.statusCode) : null,
      jsonrpcId: req.query.jsonrpcId || null,
      search: req.query.search || null, // General search field
      serverName: req.query.serverName || null, // MCP server name filter
      startTime: req.query.startTime ? BigInt(req.query.startTime) : null,
      endTime: req.query.endTime ? BigInt(req.query.endTime) : null,
      limit,
      offset,
    };
    const requests = queryRequests(db, filters);
    res.json(serializeBigInt(requests));
  });

  // Legacy endpoint for backward compatibility
  app.get('/api/packets', (req, res) => {
    const limit = parseInt(req.query.limit) || 1000;
    const offset = parseInt(req.query.offset) || 0;
    const filters = {
      sessionId: req.query.sessionId || null,
      direction: req.query.direction || null,
      method: req.query.method || null,
      jsonrpcMethod: req.query.jsonrpcMethod || null,
      statusCode: req.query.statusCode ? parseInt(req.query.statusCode) : null,
      jsonrpcId: req.query.jsonrpcId || null,
      search: req.query.search || null,
      serverName: req.query.serverName || null,
      startTime: req.query.startTime ? BigInt(req.query.startTime) : null,
      endTime: req.query.endTime ? BigInt(req.query.endTime) : null,
      limit,
      offset,
    };
    const requests = queryRequests(db, filters);
    res.json(serializeBigInt(requests));
  });

  // Get single request/response by frame number
  app.get('/api/requests/:frameNumber', (req, res) => {
    const stmt = db.prepare('SELECT * FROM packets WHERE frame_number = ?');
    const request = stmt.get(parseInt(req.params.frameNumber));
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(serializeBigInt(request));
  });

  // Legacy endpoint
  app.get('/api/packets/:frameNumber', (req, res) => {
    const stmt = db.prepare('SELECT * FROM packets WHERE frame_number = ?');
    const request = stmt.get(parseInt(req.params.frameNumber));
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(serializeBigInt(request));
  });

  // Get conversations (request/response pairs)
  app.get('/api/conversations', (req, res) => {
    const limit = parseInt(req.query.limit) || 1000;
    const offset = parseInt(req.query.offset) || 0;
    const filters = {
      sessionId: req.query.sessionId || null,
      method: req.query.method || null,
      status: req.query.status || null,
      jsonrpcId: req.query.jsonrpcId || null,
      startTime: req.query.startTime ? BigInt(req.query.startTime) : null,
      endTime: req.query.endTime ? BigInt(req.query.endTime) : null,
      limit,
      offset,
    };
    const conversations = queryConversations(db, filters);
    res.json(serializeBigInt(conversations));
  });

  // Get sessions
  app.get('/api/sessions', (req, res) => {
    const limit = parseInt(req.query.limit) || 1000;
    const offset = parseInt(req.query.offset) || 0;
    const filters = {
      startTime: req.query.startTime ? BigInt(req.query.startTime) : null,
      endTime: req.query.endTime ? BigInt(req.query.endTime) : null,
      limit,
      offset,
    };
    const sessions = getSessions(db, filters);
    res.json(serializeBigInt(sessions));
  });

  // Get session requests/responses
  app.get('/api/sessions/:sessionId/requests', (req, res) => {
    const limit = parseInt(req.query.limit) || 10000;
    const requests = getSessionRequests(db, req.params.sessionId, limit);
    res.json(serializeBigInt(requests));
  });

  // Legacy endpoint
  app.get('/api/sessions/:sessionId/packets', (req, res) => {
    const limit = parseInt(req.query.limit) || 10000;
    const requests = getSessionRequests(db, req.params.sessionId, limit);
    res.json(serializeBigInt(requests));
  });

  // Get statistics
  app.get('/api/statistics', (req, res) => {
    const filters = {
      sessionId: req.query.sessionId || null,
      startTime: req.query.startTime ? BigInt(req.query.startTime) : null,
      endTime: req.query.endTime ? BigInt(req.query.endTime) : null,
    };
    const stats = getStatistics(db, filters);
    res.json(serializeBigInt(stats));
  });

  // Get mcp-shark server logs (latest first)
  app.get('/api/composite/logs', (req, res) => {
    const limit = parseInt(req.query.limit) || 1000;
    const offset = parseInt(req.query.offset) || 0;
    // Return logs in reverse order (latest first)
    const logs = [...mcpSharkLogs].reverse().slice(offset, offset + limit);
    res.json(logs);
  });

  // Clear mcp-shark server logs
  app.post('/api/composite/logs/clear', (req, res) => {
    mcpSharkLogs = [];
    res.json({ success: true, message: 'Logs cleared' });
  });

  // Convert mcpServers format to servers format
  function convertMcpServersToServers(config) {
    const { mcpServers, servers } = config;
    const converted = { servers: {} };

    // If already in servers format, use it
    if (servers) {
      converted.servers = servers;
    }

    // Convert mcpServers to servers format
    if (mcpServers) {
      Object.entries(mcpServers).forEach(([name, cfg]) => {
        // Determine type: http if url exists, stdio if command exists, default to stdio
        const type = cfg.type || (cfg.url ? 'http' : cfg.command ? 'stdio' : 'stdio');
        converted.servers[name] = { type, ...cfg };
      });
    }

    return converted;
  }

  // API endpoint to process MCP config file
  app.post('/api/composite/setup', async (req, res) => {
    try {
      const { filePath, fileContent } = req.body;

      if (!filePath && !fileContent) {
        return res.status(400).json({ error: 'Either filePath or fileContent is required' });
      }

      // Read file content
      let content;
      let resolvedFilePath = null;

      if (fileContent) {
        content = fileContent;
        // If filePath is also provided with fileContent, use it for updating
        if (filePath) {
          resolvedFilePath = filePath.startsWith('~')
            ? path.join(homedir(), filePath.slice(1))
            : filePath;
        }
      } else {
        // Expand tilde to home directory
        resolvedFilePath = filePath.startsWith('~')
          ? path.join(homedir(), filePath.slice(1))
          : filePath;

        if (!fs.existsSync(resolvedFilePath)) {
          return res.status(404).json({ error: 'File not found', path: resolvedFilePath });
        }
        content = fs.readFileSync(resolvedFilePath, 'utf-8');
      }

      // Parse JSON
      let originalConfig;
      try {
        originalConfig = JSON.parse(content);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON file', details: e.message });
      }

      // Convert mcpServers to servers format
      const convertedConfig = convertMcpServersToServers(originalConfig);

      if (Object.keys(convertedConfig.servers).length === 0) {
        return res.status(400).json({ error: 'No servers found in config' });
      }

      // Write converted config to mcp-server's temp/mcps.json
      const mcpServerPath = findMcpServerPath();
      const tempDir = path.join(mcpServerPath, 'temp');
      const mcpsJsonPath = path.join(tempDir, 'mcps.json');

      // Ensure temp directory exists
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Write the converted config to temp/mcps.json
      fs.writeFileSync(mcpsJsonPath, JSON.stringify(convertedConfig, null, 2));

      console.log(`Wrote converted config to: ${mcpsJsonPath}`);

      // Stop existing mcp-shark server process if running
      if (mcpSharkProcess) {
        mcpSharkProcess.kill();
        mcpSharkProcess = null;
      }

      // Verify mcp-shark.js exists
      const mcpSharkJsPath = path.join(mcpServerPath, 'mcp-shark.js');
      if (!fs.existsSync(mcpSharkJsPath)) {
        return res.status(500).json({
          error: 'MCP Shark server not found',
          details: `Could not find mcp-shark.js at ${mcpSharkJsPath}`,
        });
      }

      // Start mcp-shark server
      // The mcp-shark.js will use the default path: temp/mcps.json (relative to cwd)
      // Use process.execPath (Electron's executable) when running in Electron
      // This works in both development (Electron dev) and packaged apps
      // When ELECTRON_RUN_AS_NODE is set, process.execPath still points to Electron's executable
      const nodeExecutable = process.execPath || 'node';
      
      // Set a writable data directory for the database
      // In Electron apps, use OS temp directory instead of the read-only app bundle
      // Check if we're in Electron by looking for ELECTRON_RUN_AS_NODE or process.resourcesPath
      let dataDir = null;
      if (process.env.ELECTRON_RUN_AS_NODE || process.resourcesPath) {
        // We're in Electron - use OS temp directory (always writable)
        const os = await import('node:os');
        dataDir = os.tmpdir();
        console.log(`Setting MCP_SHARK_DATA_DIR to OS temp: ${dataDir}`);
      }
      
      mcpSharkProcess = spawn(nodeExecutable, [mcpSharkJsPath], {
        cwd: mcpServerPath, // Set working directory to mcp-server so temp/mcps.json resolves correctly
        stdio: ['ignore', 'pipe', 'pipe'], // Capture stdout and stderr
        env: {
          ...process.env,
          ELECTRON_RUN_AS_NODE: '1', // Tell Electron to run as Node.js
          ...(dataDir && { MCP_SHARK_DATA_DIR: dataDir }), // Set data directory if in Electron
        },
      });

      // Clear previous logs
      mcpSharkLogs = [];
      const logEntry = (type, data) => {
        const timestamp = new Date().toISOString();
        const line = data.toString();
        mcpSharkLogs.push({ timestamp, type, line });
        // Keep only last MAX_LOG_LINES
        if (mcpSharkLogs.length > MAX_LOG_LINES) {
          mcpSharkLogs.shift();
        }
        // Broadcast to WebSocket clients
        broadcastLogUpdate({ timestamp, type, line });
      };

      // Capture stdout
      mcpSharkProcess.stdout.on('data', (data) => {
        logEntry('stdout', data);
        process.stdout.write(data); // Also output to parent process
      });

      // Capture stderr
      mcpSharkProcess.stderr.on('data', (data) => {
        logEntry('stderr', data);
        process.stderr.write(data); // Also output to parent process
      });

      mcpSharkProcess.on('error', (err) => {
        console.error('Failed to start mcp-shark server:', err);
        logEntry('error', `Failed to start mcp-shark server: ${err.message}`);
        mcpSharkProcess = null;
        return res.status(500).json({
          error: 'Failed to start mcp-shark server',
          details: err.message,
        });
      });

      mcpSharkProcess.on('exit', (code) => {
        const message = `MCP Shark server process exited with code ${code}`;
        console.log(message);
        logEntry('exit', message);
        mcpSharkProcess = null;
      });

      // Wait for mcp-shark server to be ready before updating the config file
      try {
        console.log('Waiting for mcp-shark server to start on port 9851...');
        await checkPortReady(9851, 'localhost', 15000); // Wait up to 15 seconds
        console.log('MCP Shark server is ready!');

        // Update original file to point to mcp-shark server
        // Preserve the original structure but replace mcpServers with mcp-shark endpoint
        const updatedConfig = {
          ...originalConfig,
          mcpServers: {
            'mcp-shark-server': {
              type: 'http',
              url: 'http://localhost:9851/mcp',
            },
          },
        };

        // If filePath provided, update the file
        if (resolvedFilePath && fs.existsSync(resolvedFilePath)) {
          // Create backup first
          const backupPath = `${resolvedFilePath}.backup`;
          fs.copyFileSync(resolvedFilePath, backupPath);

          // Store original content for restoration
          originalConfigData = {
            filePath: resolvedFilePath,
            originalContent: content, // Store the original JSON content
            backupPath: backupPath,
          };

          fs.writeFileSync(resolvedFilePath, JSON.stringify(updatedConfig, null, 2));
          console.log(`Updated config file: ${resolvedFilePath}`);
        } else {
          // Clear original config data if no file path
          originalConfigData = null;
        }

        res.json({
          success: true,
          message: 'MCP Shark server started successfully and config file updated',
          convertedConfig,
          updatedConfig,
          filePath: resolvedFilePath || null,
          backupPath: resolvedFilePath ? `${resolvedFilePath}.backup` : null,
        });
      } catch (waitError) {
        console.error('MCP Shark server did not start in time:', waitError);
        // Kill the process if it's still running
        if (mcpSharkProcess) {
          mcpSharkProcess.kill();
          mcpSharkProcess = null;
        }
        return res.status(500).json({
          error: 'MCP Shark server failed to start',
          details: waitError.message,
        });
      }
    } catch (error) {
      console.error('Error setting up mcp-shark server:', error);
      res.status(500).json({ error: 'Failed to setup mcp-shark server', details: error.message });
    }
  });

  // API endpoint to stop mcp-shark server
  app.post('/api/composite/stop', (req, res) => {
    try {
      if (mcpSharkProcess) {
        mcpSharkProcess.kill();
        mcpSharkProcess = null;

        // Restore original config when stopping
        restoreOriginalConfig();

        res.json({ success: true, message: 'MCP Shark server stopped and config restored' });
      } else {
        res.json({ success: true, message: 'MCP Shark server was not running' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to stop mcp-shark server', details: error.message });
    }
  });

  // API endpoint to get mcp-shark server status
  app.get('/api/composite/status', (req, res) => {
    res.json({
      running: mcpSharkProcess !== null,
      pid: mcpSharkProcess?.pid || null,
    });
  });

  // API endpoint to read MCP config file
  app.get('/api/config/read', (req, res) => {
    try {
      const { filePath } = req.query;

      if (!filePath) {
        return res.status(400).json({ error: 'filePath is required' });
      }

      // Expand tilde to home directory
      let resolvedPath = filePath;
      if (filePath.startsWith('~')) {
        resolvedPath = path.join(homedir(), filePath.slice(1));
      }

      if (!fs.existsSync(resolvedPath)) {
        return res.status(404).json({ error: 'File not found', path: resolvedPath });
      }

      const content = fs.readFileSync(resolvedPath, 'utf-8');
      let parsed = null;
      try {
        parsed = JSON.parse(content);
      } catch (e) {
        // Not valid JSON, return raw content
      }

      res.json({
        success: true,
        filePath: resolvedPath,
        displayPath: resolvedPath.replace(homedir(), '~'),
        content: content,
        parsed: parsed,
        exists: true,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to read file', details: error.message });
    }
  });

  // API endpoint to detect default MCP config paths
  app.get('/api/config/detect', (req, res) => {
    const detected = [];
    const platform = process.platform;
    const homeDir = homedir();

    // Cursor paths
    const cursorPaths = [
      path.join(homeDir, '.cursor', 'mcp.json'),
      ...(platform === 'win32'
        ? [path.join(process.env.USERPROFILE || '', '.cursor', 'mcp.json')]
        : []),
    ];

    // Windsurf paths
    const windsurfPaths = [
      path.join(homeDir, '.codeium', 'windsurf', 'mcp_config.json'),
      ...(platform === 'win32'
        ? [path.join(process.env.USERPROFILE || '', '.codeium', 'windsurf', 'mcp_config.json')]
        : []),
    ];

    // Check Cursor paths
    for (const cursorPath of cursorPaths) {
      if (fs.existsSync(cursorPath)) {
        detected.push({
          editor: 'Cursor',
          path: cursorPath,
          displayPath: cursorPath.replace(homeDir, '~'),
          exists: true,
        });
        break; // Only add first found
      }
    }

    // Check Windsurf paths
    for (const windsurfPath of windsurfPaths) {
      if (fs.existsSync(windsurfPath)) {
        detected.push({
          editor: 'Windsurf',
          path: windsurfPath,
          displayPath: windsurfPath.replace(homeDir, '~'),
          exists: true,
        });
        break; // Only add first found
      }
    }

    // Also add default paths even if they don't exist (for reference)
    const defaultPaths = [
      {
        editor: 'Cursor',
        path: path.join(homeDir, '.cursor', 'mcp.json'),
        displayPath: '~/.cursor/mcp.json',
        exists: fs.existsSync(path.join(homeDir, '.cursor', 'mcp.json')),
      },
      {
        editor: 'Windsurf',
        path: path.join(homeDir, '.codeium', 'windsurf', 'mcp_config.json'),
        displayPath: '~/.codeium/windsurf/mcp_config.json',
        exists: fs.existsSync(path.join(homeDir, '.codeium', 'windsurf', 'mcp_config.json')),
      },
    ];

    // If we found existing files, only return those. Otherwise return defaults.
    const result = detected.length > 0 ? detected : defaultPaths;

    res.json({
      detected: result,
      platform,
      homeDir,
    });
  });

  // Cleanup on server shutdown
  const cleanup = () => {
    if (mcpSharkProcess) {
      mcpSharkProcess.kill();
      mcpSharkProcess = null;
    }
    // Restore original config on shutdown
    restoreOriginalConfig();
  };

  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);

  // Also handle uncaught exceptions and unhandled rejections
  process.on('exit', () => {
    restoreOriginalConfig();
  });

  const staticPath = path.join(__dirname, 'dist');
  app.use(express.static(staticPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });

  const clients = new Set();
  let lastTs = 0;

  wss.on('connection', (ws) => {
    clients.add(ws);
    ws.on('close', () => clients.delete(ws));
  });

  const notifyClients = () => {
    const requests = queryRequests(db, { limit: 100 });
    const message = JSON.stringify({ type: 'update', data: serializeBigInt(requests) });
    clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  };

  const broadcastLogUpdate = (logEntry) => {
    const message = JSON.stringify({ type: 'log', data: logEntry });
    clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  };

  setInterval(() => {
    const lastCheck = db.prepare('SELECT MAX(timestamp_ns) as max_ts FROM packets').get();
    if (lastCheck && lastCheck.max_ts > lastTs) {
      lastTs = lastCheck.max_ts;
      notifyClients();
    }
  }, 500);

  return { server };
}

export async function runUIServer(dbPath) {
  const db = openDb(dbPath);
  const port = parseInt(process.env.UI_PORT) || 9853;
  const { server } = createUIServer(db);

  server.listen(port, '0.0.0.0', () => {
    console.log(`UI server listening on http://localhost:${port}`);
  });

  // Cleanup on server close
  server.on('close', () => {
    if (mcpSharkProcess) {
      mcpSharkProcess.kill();
      mcpSharkProcess = null;
    }
    restoreOriginalConfig();
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dbPath =
    process.env.DB_PATH ||
    process.argv[2] ||
    path.join(process.cwd(), '../mcp-server/temp/db/mcp-shark.sqlite');
  runUIServer(dbPath).catch(console.error);
}
