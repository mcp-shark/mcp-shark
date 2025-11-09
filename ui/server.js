import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'url';
import * as fs from 'node:fs';
import { spawn } from 'node:child_process';
import { homedir } from 'node:os';
import { createConnection } from 'net';

import { enhancePath } from './paths.js';
import {
  queryRequests,
  queryConversations,
  getSessionRequests,
  getSessions,
  getStatistics,
} from 'mcp-shark-common/db/query.js';
import { openDb } from 'mcp-shark-common/db/init.js';
import {
  getMcpConfigPath,
  getWorkingDirectory,
  getDatabaseFile,
} from 'mcp-shark-common/configs/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Legacy function name for backward compatibility
const getSessionPackets = getSessionRequests;

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

export function createUIServer() {
  const db = openDb(getDatabaseFile());
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
    // Clear previous logs
    mcpSharkLogs = [];
    function logEntry(type, data) {
      const timestamp = new Date().toISOString();
      const line = data.toString();
      mcpSharkLogs.push({ timestamp, type, line });
      // Keep only last MAX_LOG_LINES
      if (mcpSharkLogs.length > MAX_LOG_LINES) {
        mcpSharkLogs.shift();
      }
      // Broadcast to WebSocket clients
      broadcastLogUpdate({ timestamp, type, line });
    }
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
      // In Electron, use a writable location (OS temp directory)
      const mcpServerPath = findMcpServerPath();
      const mcpsJsonPath = getMcpConfigPath();

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
      // Pass the config path as an argument so it works in both Electron and non-Electron environments
      // Use process.execPath (Electron's executable) when running in Electron
      // This works in both development (Electron dev) and packaged apps
      // When ELECTRON_RUN_AS_NODE is set, process.execPath still points to Electron's executable
      const nodeExecutable = process.execPath || 'node';

      // Pass the config path as an argument to mcp-shark.js
      // This ensures it reads from the correct location in both Electron and non-Electron environments
      logEntry('info', `[UI Server] Spawning MCP-Shark server...`);
      logEntry('info', `[UI Server] Executable: ${nodeExecutable}`);
      logEntry('info', `[UI Server] Script: ${mcpSharkJsPath}`);
      logEntry('info', `[UI Server] Config: ${mcpsJsonPath}`);
      logEntry('info', `[UI Server] CWD: ${mcpServerPath}`);
      logEntry('info', `[UI Server] Data dir: ${getWorkingDirectory()}`);

      const enhancedPath = enhancePath(process.env.PATH);
      mcpSharkProcess = spawn(nodeExecutable, [mcpSharkJsPath, mcpsJsonPath], {
        cwd: mcpServerPath, // Set working directory to mcp-server
        stdio: ['ignore', 'pipe', 'pipe'], // Capture stdout and stderr
        env: {
          ...process.env,
          PATH: enhancedPath,
        },
      });

      console.log(`[UI Server] MCP-Shark process spawned with PID: ${mcpSharkProcess.pid}`);

      logEntry('info', `[UI Server] Enhanced PATH: ${enhancedPath}`);
      // Capture stdout - preserve exact output for debugging
      mcpSharkProcess.stdout.on('data', (data) => {
        logEntry('stdout', data);
        process.stdout.write(data); // Also output to parent process
      });

      // Capture stderr - preserve exact output for debugging
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

      mcpSharkProcess.on('exit', (code, signal) => {
        const message = `MCP Shark server process exited with code ${code}${signal ? ` (signal: ${signal})` : ''}`;
        console.log(`[UI Server] ${message}`);
        logEntry('exit', message);
        if (code !== 0 && code !== null) {
          console.error(`[UI Server] MCP-Shark process exited with non-zero code: ${code}`);
          logEntry('error', `Process exited with code ${code}`);
        }
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

export async function runUIServer() {
  const port = parseInt(process.env.UI_PORT) || 9853;
  const { server } = createUIServer();

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
  runUIServer().catch(console.error);
}
