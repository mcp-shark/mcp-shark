import * as fs from 'node:fs';
import { homedir } from 'node:os';
import * as path from 'node:path';
import { startMcpSharkServer } from '@mcp-shark/mcp-shark/mcp-server';
import { getMcpConfigPath } from 'mcp-shark-common/configs/index.js';
import { getSelectedServiceNames, updateConfigFile } from '../utils/config-update.js';
import { clearOriginalConfig, convertMcpServersToServers } from '../utils/config.js';
import { createLogEntry } from '../utils/process.js';

const MAX_LOG_LINES = 10000;

function resolveFileData(filePath, fileContent) {
  if (fileContent) {
    const resolvedFilePath = filePath
      ? filePath.startsWith('~')
        ? path.join(homedir(), filePath.slice(1))
        : filePath
      : null;
    return { content: fileContent, resolvedFilePath };
  }

  const resolvedFilePath = filePath.startsWith('~')
    ? path.join(homedir(), filePath.slice(1))
    : filePath;

  if (!fs.existsSync(resolvedFilePath)) {
    return null;
  }

  return {
    content: fs.readFileSync(resolvedFilePath, 'utf-8'),
    resolvedFilePath,
  };
}

function parseJsonConfig(content) {
  try {
    return { config: JSON.parse(content), error: null };
  } catch (e) {
    return { config: null, error: e };
  }
}

export function createCompositeRoutes(
  getMcpSharkProcess,
  setMcpSharkProcess,
  mcpSharkLogs,
  broadcastLogUpdate
) {
  const router = {};

  router.setup = async (req, res) => {
    mcpSharkLogs.length = 0;
    const logEntry = createLogEntry(mcpSharkLogs, broadcastLogUpdate);

    try {
      const { filePath, fileContent, selectedServices } = req.body;

      if (!filePath && !fileContent) {
        return res.status(400).json({ error: 'Either filePath or fileContent is required' });
      }

      const fileData = resolveFileData(filePath, fileContent);

      if (!fileData) {
        const resolvedFilePath = filePath.startsWith('~')
          ? path.join(homedir(), filePath.slice(1))
          : filePath;
        return res.status(404).json({ error: 'File not found', path: resolvedFilePath });
      }

      const parseResult = parseJsonConfig(fileData.content);

      if (!parseResult.config) {
        return res.status(400).json({
          error: 'Invalid JSON file',
          details: parseResult.error ? parseResult.error.message : 'Failed to parse JSON',
        });
      }

      const originalConfig = parseResult.config;
      const baseConvertedConfig = convertMcpServersToServers(originalConfig);

      const filterServers = (config, services) => {
        const filteredServers = {};
        services.forEach((serviceName) => {
          if (config.servers[serviceName]) {
            filteredServers[serviceName] = config.servers[serviceName];
          }
        });
        return { servers: filteredServers };
      };

      const convertedConfig =
        selectedServices && Array.isArray(selectedServices) && selectedServices.length > 0
          ? filterServers(baseConvertedConfig, selectedServices)
          : baseConvertedConfig;

      if (Object.keys(convertedConfig.servers).length === 0) {
        return res.status(400).json({ error: 'No servers found in config' });
      }

      const mcpsJsonPath = getMcpConfigPath();
      fs.writeFileSync(mcpsJsonPath, JSON.stringify(convertedConfig, null, 2));
      console.log(`Wrote converted config to: ${mcpsJsonPath}`);

      const currentServer = getMcpSharkProcess();
      if (currentServer?.stop) {
        await currentServer.stop();
        setMcpSharkProcess(null);
      }

      logEntry('info', '[UI Server] Starting MCP-Shark server as library...');
      logEntry('info', `[UI Server] Config: ${mcpsJsonPath}`);

      const serverInstance = await startMcpSharkServer({
        configPath: mcpsJsonPath,
        port: 9851,
        logger: {
          info: (msg, ...args) => {
            const message = args.length > 0 ? `${msg} ${args.join(' ')}` : msg;
            logEntry('info', message);
            console.log(`[MCP-Shark] ${message}`);
          },
          error: (msg, ...args) => {
            const message = args.length > 0 ? `${msg} ${args.join(' ')}` : msg;
            logEntry('error', message);
            console.error(`[MCP-Shark] ${message}`);
          },
          warn: (msg, ...args) => {
            const message = args.length > 0 ? `${msg} ${args.join(' ')}` : msg;
            logEntry('stderr', message);
            console.warn(`[MCP-Shark] ${message}`);
          },
          debug: (msg, ...args) => {
            const message = args.length > 0 ? `${msg} ${args.join(' ')}` : msg;
            logEntry('stdout', message);
          },
          level: 'info',
        },
        onError: (err) => {
          logEntry('error', `Failed to start mcp-shark server: ${err.message}`);
          setMcpSharkProcess(null);
          throw err;
        },
        onReady: () => {
          logEntry('info', 'MCP Shark server is ready!');
          console.log('MCP Shark server is ready!');
        },
      });

      setMcpSharkProcess(serverInstance);
      console.log('MCP Shark server started successfully');

      const selectedServiceNames = getSelectedServiceNames(originalConfig, selectedServices);
      const { updatedConfig, backupPath: createdBackupPath } = updateConfigFile(
        originalConfig,
        selectedServiceNames,
        fileData.resolvedFilePath,
        fileData.content,
        mcpSharkLogs,
        broadcastLogUpdate
      );

      if (!fileData.resolvedFilePath) {
        clearOriginalConfig();
      }

      res.json({
        success: true,
        message: 'MCP Shark server started successfully and config file updated',
        convertedConfig,
        updatedConfig,
        filePath: fileData.resolvedFilePath || null,
        backupPath: createdBackupPath || null,
      });
    } catch (error) {
      console.error('Error setting up mcp-shark server:', error);
      const timestamp = new Date().toISOString();
      const errorLog = {
        timestamp,
        type: 'error',
        line: `[ERROR] Failed to setup mcp-shark server: ${error.message}`,
      };
      mcpSharkLogs.push(errorLog);
      if (mcpSharkLogs.length > MAX_LOG_LINES) {
        mcpSharkLogs.shift();
      }
      broadcastLogUpdate(errorLog);
      res.status(500).json({ error: 'Failed to setup mcp-shark server', details: error.message });
    }
  };

  router.stop = async (_req, res, restoreOriginalConfig) => {
    try {
      const currentServer = getMcpSharkProcess();
      if (currentServer?.stop) {
        await currentServer.stop();
        setMcpSharkProcess(null);

        const restored = restoreOriginalConfig();

        if (restored) {
          const timestamp = new Date().toISOString();
          const restoreLog = {
            timestamp,
            type: 'stdout',
            line: '[RESTORE] Restored original config',
          };
          mcpSharkLogs.push(restoreLog);
          if (mcpSharkLogs.length > MAX_LOG_LINES) {
            mcpSharkLogs.shift();
          }
          broadcastLogUpdate(restoreLog);
        }

        res.json({ success: true, message: 'MCP Shark server stopped and config restored' });
      } else {
        res.json({ success: true, message: 'MCP Shark server was not running' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to stop mcp-shark server', details: error.message });
    }
  };

  router.getStatus = (_req, res) => {
    const currentServer = getMcpSharkProcess();
    res.json({
      running: currentServer !== null,
      pid: null, // No process PID when using library
    });
  };

  router.getServers = (_req, res) => {
    try {
      const mcpsJsonPath = getMcpConfigPath();
      if (!fs.existsSync(mcpsJsonPath)) {
        return res.json({ servers: [] });
      }

      const configContent = fs.readFileSync(mcpsJsonPath, 'utf-8');
      const config = JSON.parse(configContent);
      const servers = config.servers ? Object.keys(config.servers) : [];
      res.json({ servers });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get servers', details: error.message });
    }
  };

  return router;
}
