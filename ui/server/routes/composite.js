import * as path from 'node:path';
import * as fs from 'node:fs';
import { homedir } from 'node:os';
import { checkPortReady } from '../utils/port.js';
import { findMcpServerPath } from '../utils/paths.js';
import { convertMcpServersToServers, clearOriginalConfig } from '../utils/config.js';
import { getMcpConfigPath } from 'mcp-shark-common/configs/index.js';
import {
  createLogEntry,
  spawnMcpSharkServer,
  setupProcessHandlers,
  getMcpSharkJsPath,
} from '../utils/process.js';
import { updateConfigFile, getSelectedServiceNames } from '../utils/config-update.js';

const MAX_LOG_LINES = 10000;

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

      const fileData = (() => {
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
      })();

      if (!fileData) {
        const resolvedFilePath = filePath.startsWith('~')
          ? path.join(homedir(), filePath.slice(1))
          : filePath;
        return res.status(404).json({ error: 'File not found', path: resolvedFilePath });
      }

      const parseResult = (() => {
        try {
          return { config: JSON.parse(fileData.content), error: null };
        } catch (e) {
          return { config: null, error: e };
        }
      })();

      if (!parseResult.config) {
        return res.status(400).json({
          error: 'Invalid JSON file',
          details: parseResult.error ? parseResult.error.message : 'Failed to parse JSON',
        });
      }

      const originalConfig = parseResult.config;
      let convertedConfig = convertMcpServersToServers(originalConfig);

      if (selectedServices && Array.isArray(selectedServices) && selectedServices.length > 0) {
        const filteredServers = {};
        selectedServices.forEach((serviceName) => {
          if (convertedConfig.servers[serviceName]) {
            filteredServers[serviceName] = convertedConfig.servers[serviceName];
          }
        });
        convertedConfig = { servers: filteredServers };
      }

      if (Object.keys(convertedConfig.servers).length === 0) {
        return res.status(400).json({ error: 'No servers found in config' });
      }

      const mcpServerPath = findMcpServerPath();
      const mcpsJsonPath = getMcpConfigPath();
      fs.writeFileSync(mcpsJsonPath, JSON.stringify(convertedConfig, null, 2));
      console.log(`Wrote converted config to: ${mcpsJsonPath}`);

      const currentProcess = getMcpSharkProcess();
      if (currentProcess) {
        currentProcess.kill();
        setMcpSharkProcess(null);
      }

      const mcpSharkJsPath = getMcpSharkJsPath();
      if (!fs.existsSync(mcpSharkJsPath)) {
        return res.status(500).json({
          error: 'MCP Shark server not found',
          details: `Could not find mcp-shark.js at ${mcpSharkJsPath}`,
        });
      }

      const processHandle = spawnMcpSharkServer(mcpSharkJsPath, mcpsJsonPath, logEntry);
      setMcpSharkProcess(processHandle);

      setupProcessHandlers(
        processHandle,
        logEntry,
        (err) => {
          setMcpSharkProcess(null);
          return res.status(500).json({
            error: 'Failed to start mcp-shark server',
            details: err.message,
          });
        },
        () => {
          setMcpSharkProcess(null);
        }
      );

      try {
        console.log('Waiting for mcp-shark server to start on port 9851...');
        await checkPortReady(9851, 'localhost', 15000);
        console.log('MCP Shark server is ready!');

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
      } catch (waitError) {
        console.error('MCP Shark server did not start in time:', waitError);
        if (processHandle) {
          processHandle.kill();
          setMcpSharkProcess(null);
        }
        const timestamp = new Date().toISOString();
        const errorLog = {
          timestamp,
          type: 'error',
          line: `[ERROR] MCP Shark server failed to start: ${waitError.message}`,
        };
        mcpSharkLogs.push(errorLog);
        if (mcpSharkLogs.length > MAX_LOG_LINES) {
          mcpSharkLogs.shift();
        }
        broadcastLogUpdate(errorLog);
        return res.status(500).json({
          error: 'MCP Shark server failed to start',
          details: waitError.message,
        });
      }
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

  router.stop = (req, res, restoreOriginalConfig) => {
    try {
      const currentProcess = getMcpSharkProcess();
      if (currentProcess) {
        currentProcess.kill();
        setMcpSharkProcess(null);

        const restored = restoreOriginalConfig();

        if (restored) {
          const timestamp = new Date().toISOString();
          const restoreLog = {
            timestamp,
            type: 'stdout',
            line: `[RESTORE] Restored original config`,
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

  router.getStatus = (req, res) => {
    const currentProcess = getMcpSharkProcess();
    res.json({
      running: currentProcess !== null,
      pid: currentProcess?.pid || null,
    });
  };

  router.getServers = (req, res) => {
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
