import Database from 'better-sqlite3';

function createTables(db) {
  db.exec(`
    -- Packet capture table
    -- Each HTTP request/response is stored as a packet for forensic analysis
    CREATE TABLE IF NOT EXISTS packets (
      frame_number INTEGER PRIMARY KEY AUTOINCREMENT,
      
      -- Timestamps (nanosecond precision)
      timestamp_ns INTEGER NOT NULL,  -- Unix timestamp in nanoseconds
      timestamp_iso TEXT NOT NULL,    -- ISO 8601 formatted timestamp for readability
      
      -- Packet direction and protocol
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
      
      -- Packet metadata
      length INTEGER NOT NULL,        -- Total packet size in bytes
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

  return db;
}

export function initDb(dbConnectionString) {
  const db = new Database(dbConnectionString);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  return createTables(db);
}
