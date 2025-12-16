import * as fs from 'node:fs';
import { homedir } from 'node:os';
import * as path from 'node:path';
import { startMcpSharkServer } from '@mcp-shark/mcp-shark/mcp-server';
import { getMcpConfigPath } from '#common/configs';
import { getSelectedServiceNames, updateConfigFile } from '../../utils/config-update.js';
import { clearOriginalConfig, convertMcpServersToServers } from '../../utils/config.js';
import logger from '../../utils/logger.js';
import { createLogEntry } from '../../utils/process.js';
import { filterServers, parseJsonConfig, resolveFileData } from './utils.js';

const MAX_LOG_LINES = 10000;

export async function setup(
  req,
  res,
  getMcpSharkProcess,
  setMcpSharkProcess,
  mcpSharkLogs,
  broadcastLogUpdate
) {
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

    const convertedConfig =
      selectedServices && Array.isArray(selectedServices) && selectedServices.length > 0
        ? filterServers(baseConvertedConfig, selectedServices)
        : baseConvertedConfig;

    if (Object.keys(convertedConfig.servers).length === 0) {
      return res.status(400).json({ error: 'No servers found in config' });
    }

    const mcpsJsonPath = getMcpConfigPath();
    fs.writeFileSync(mcpsJsonPath, JSON.stringify(convertedConfig, null, 2));
    logger.info({ path: mcpsJsonPath }, 'Wrote converted config');

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
      onError: (err) => {
        logEntry('error', `Failed to start mcp-shark server: ${err.message}`);
        setMcpSharkProcess(null);
        throw err;
      },
      onReady: () => {
        logEntry('info', 'MCP Shark server is ready!');
        logger.info('MCP Shark server is ready!');
      },
    });

    setMcpSharkProcess(serverInstance);
    logger.info('MCP Shark server started successfully');

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
    logger.error({ error: error.message }, 'Error setting up mcp-shark server');
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
}
