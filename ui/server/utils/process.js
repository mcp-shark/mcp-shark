import { spawn } from 'node:child_process';
import * as path from 'node:path';
import { findMcpServerPath } from './paths.js';
import { enhancePath } from '../../paths.js';
import { getMcpConfigPath, getWorkingDirectory } from 'mcp-shark-common/configs/index.js';

const MAX_LOG_LINES = 10000;

export function createLogEntry(mcpSharkLogs, broadcastLogUpdate) {
  return function logEntry(type, data) {
    const timestamp = new Date().toISOString();
    const line = data.toString();
    mcpSharkLogs.push({ timestamp, type, line });
    if (mcpSharkLogs.length > MAX_LOG_LINES) {
      mcpSharkLogs.shift();
    }
    broadcastLogUpdate({ timestamp, type, line });
  };
}

export function spawnMcpSharkServer(mcpSharkJsPath, mcpsJsonPath, logEntry) {
  const mcpServerPath = findMcpServerPath();
  const nodeExecutable = process.execPath || 'node';
  const enhancedPath = enhancePath(process.env.PATH);

  logEntry('info', `[UI Server] Spawning MCP-Shark server...`);
  logEntry('info', `[UI Server] Executable: ${nodeExecutable}`);
  logEntry('info', `[UI Server] Script: ${mcpSharkJsPath}`);
  logEntry('info', `[UI Server] Config: ${mcpsJsonPath}`);
  logEntry('info', `[UI Server] CWD: ${mcpServerPath}`);
  logEntry('info', `[UI Server] Data dir: ${getWorkingDirectory()}`);
  logEntry('info', `[UI Server] Enhanced PATH: ${enhancedPath}`);

  const processHandle = spawn(nodeExecutable, [mcpSharkJsPath, mcpsJsonPath], {
    cwd: mcpServerPath,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      PATH: enhancedPath,
    },
  });

  console.log(`[UI Server] MCP-Shark process spawned with PID: ${processHandle.pid}`);

  processHandle.stdout.on('data', (data) => {
    logEntry('stdout', data);
    process.stdout.write(data);
  });

  processHandle.stderr.on('data', (data) => {
    logEntry('stderr', data);
    process.stderr.write(data);
  });

  return processHandle;
}

export function setupProcessHandlers(processHandle, logEntry, onError, onExit) {
  processHandle.on('error', (err) => {
    console.error('Failed to start mcp-shark server:', err);
    logEntry('error', `Failed to start mcp-shark server: ${err.message}`);
    if (onError) onError(err);
  });

  processHandle.on('exit', (code, signal) => {
    const message = `MCP Shark server process exited with code ${code}${signal ? ` (signal: ${signal})` : ''}`;
    console.log(`[UI Server] ${message}`);
    logEntry('exit', message);
    if (code !== 0 && code !== null) {
      console.error(`[UI Server] MCP-Shark process exited with non-zero code: ${code}`);
      logEntry('error', `Process exited with code ${code}`);
    }
    if (onExit) onExit(code, signal);
  });
}

export function getMcpSharkJsPath() {
  const mcpServerPath = findMcpServerPath();
  return path.join(mcpServerPath, 'mcp-shark.js');
}
