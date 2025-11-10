import * as fs from 'node:fs';
import * as path from 'node:path';
import { homedir } from 'node:os';
import { storeOriginalConfig } from './config.js';

export function updateConfigFile(
  originalConfig,
  selectedServiceNames,
  resolvedFilePath,
  content,
  mcpSharkLogs,
  broadcastLogUpdate
) {
  const hasMcpServers = originalConfig.mcpServers && typeof originalConfig.mcpServers === 'object';
  const hasServers = originalConfig.servers && typeof originalConfig.servers === 'object';

  const updatedConfig = { ...originalConfig };

  if (hasMcpServers) {
    const updatedMcpServers = {};
    if (selectedServiceNames.size > 0) {
      updatedMcpServers['mcp-shark-server'] = {
        type: 'http',
        url: 'http://localhost:9851/mcp',
      };
    }
    Object.entries(originalConfig.mcpServers).forEach(([name, cfg]) => {
      if (!selectedServiceNames.has(name)) {
        updatedMcpServers[name] = cfg;
      }
    });
    updatedConfig.mcpServers = updatedMcpServers;
  } else if (hasServers) {
    const updatedServers = {};
    if (selectedServiceNames.size > 0) {
      updatedServers['mcp-shark-server'] = {
        type: 'http',
        url: 'http://localhost:9851/mcp',
      };
    }
    Object.entries(originalConfig.servers).forEach(([name, cfg]) => {
      if (!selectedServiceNames.has(name)) {
        updatedServers[name] = cfg;
      }
    });
    updatedConfig.servers = updatedServers;
  } else {
    updatedConfig.mcpServers = {
      'mcp-shark-server': {
        type: 'http',
        url: 'http://localhost:9851/mcp',
      },
    };
  }

  if (resolvedFilePath && fs.existsSync(resolvedFilePath)) {
    const backupPath = `${resolvedFilePath}.backup`;
    fs.copyFileSync(resolvedFilePath, backupPath);
    storeOriginalConfig(resolvedFilePath, content, backupPath);

    fs.writeFileSync(resolvedFilePath, JSON.stringify(updatedConfig, null, 2));
    console.log(`Updated config file: ${resolvedFilePath}`);

    const timestamp = new Date().toISOString();
    const backupLog = {
      timestamp,
      type: 'stdout',
      line: `[BACKUP] Created backup: ${backupPath.replace(homedir(), '~')}`,
    };
    mcpSharkLogs.push(backupLog);
    if (mcpSharkLogs.length > 10000) {
      mcpSharkLogs.shift();
    }
    broadcastLogUpdate(backupLog);
  }

  return updatedConfig;
}

export function getSelectedServiceNames(originalConfig, selectedServices) {
  if (selectedServices && Array.isArray(selectedServices) && selectedServices.length > 0) {
    return new Set(selectedServices);
  }

  const selectedServiceNames = new Set();
  const hasMcpServers = originalConfig.mcpServers && typeof originalConfig.mcpServers === 'object';
  const hasServers = originalConfig.servers && typeof originalConfig.servers === 'object';

  if (hasMcpServers) {
    Object.keys(originalConfig.mcpServers).forEach((name) => selectedServiceNames.add(name));
  } else if (hasServers) {
    Object.keys(originalConfig.servers).forEach((name) => selectedServiceNames.add(name));
  }

  return selectedServiceNames;
}
