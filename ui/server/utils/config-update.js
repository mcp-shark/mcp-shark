import * as fs from 'node:fs';
import { homedir } from 'node:os';
import * as path from 'node:path';
import { storeOriginalConfig } from './config.js';
import logger from './logger.js';

function findLatestBackup(filePath) {
  const dir = path.dirname(filePath);
  const basename = path.basename(filePath);
  const backups = [];

  if (!fs.existsSync(dir)) {
    return null;
  }

  try {
    const files = fs.readdirSync(dir);

    // Find backups with new format: .mcp.json-mcpshark.<datetime>.json
    files
      .filter((file) => {
        // Match pattern: .<basename>-mcpshark.<datetime>.json
        return /^\.(.+)-mcpshark\.\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.json$/.test(file);
      })
      .forEach((file) => {
        const match = file.match(/^\.(.+)-mcpshark\./);
        if (match && match[1] === basename) {
          const backupPath = path.join(dir, file);
          const stats = fs.statSync(backupPath);
          backups.push({
            backupPath,
            modifiedAt: stats.mtime,
          });
        }
      });

    // Also check for old .backup format
    const oldBackupPath = `${filePath}.backup`;
    if (fs.existsSync(oldBackupPath)) {
      const stats = fs.statSync(oldBackupPath);
      backups.push({
        backupPath: oldBackupPath,
        modifiedAt: stats.mtime,
      });
    }

    if (backups.length === 0) {
      return null;
    }

    // Sort by modifiedAt (latest first) and return the latest
    backups.sort((a, b) => b.modifiedAt - a.modifiedAt);
    return backups[0].backupPath;
  } catch (error) {
    logger.error({ error: error.message }, 'Error finding latest backup');
    return null;
  }
}

function shouldCreateBackup(
  latestBackupPath,
  resolvedFilePath,
  content,
  mcpSharkLogs,
  broadcastLogUpdate
) {
  if (!latestBackupPath || !fs.existsSync(latestBackupPath)) {
    return true;
  }

  try {
    const latestBackupContent = fs.readFileSync(latestBackupPath, 'utf-8');
    const currentContent = content || fs.readFileSync(resolvedFilePath, 'utf-8');

    // Normalize both contents for comparison (remove whitespace differences)
    const normalizeContent = (str) => {
      try {
        // Try to parse as JSON and re-stringify to normalize
        return JSON.stringify(JSON.parse(str), null, 2);
      } catch {
        // If not valid JSON, just trim
        return str.trim();
      }
    };

    const normalizedBackup = normalizeContent(latestBackupContent);
    const normalizedCurrent = normalizeContent(currentContent);

    if (normalizedBackup === normalizedCurrent) {
      const timestamp = new Date().toISOString();
      const skipLog = {
        timestamp,
        type: 'stdout',
        line: `[BACKUP] Skipped backup (no changes detected): ${resolvedFilePath.replace(homedir(), '~')}`,
      };
      mcpSharkLogs.push(skipLog);
      if (mcpSharkLogs.length > 10000) {
        mcpSharkLogs.shift();
      }
      broadcastLogUpdate(skipLog);
      return false;
    }
    return true;
  } catch (error) {
    logger.error({ error: error.message }, 'Error comparing with latest backup');
    // If comparison fails, create backup to be safe
    return true;
  }
}

function createBackup(resolvedFilePath, content, mcpSharkLogs, broadcastLogUpdate) {
  // Create backup with new format: .mcp.json-mcpshark.<datetime>.json
  const datetimeStr = formatDateTimeForBackup();
  const dir = path.dirname(resolvedFilePath);
  const basename = path.basename(resolvedFilePath);
  const backupPath = path.join(dir, `.${basename}-mcpshark.${datetimeStr}.json`);
  fs.copyFileSync(resolvedFilePath, backupPath);
  storeOriginalConfig(resolvedFilePath, content, backupPath);

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
  return backupPath;
}

function computeBackupPath(resolvedFilePath, content, mcpSharkLogs, broadcastLogUpdate) {
  if (!resolvedFilePath || !fs.existsSync(resolvedFilePath)) {
    return null;
  }

  // Check if we need to create a backup by comparing with latest backup
  const latestBackupPath = findLatestBackup(resolvedFilePath);
  const needsBackup = shouldCreateBackup(
    latestBackupPath,
    resolvedFilePath,
    content,
    mcpSharkLogs,
    broadcastLogUpdate
  );

  if (needsBackup) {
    return createBackup(resolvedFilePath, content, mcpSharkLogs, broadcastLogUpdate);
  }

  // Still store the original config reference even if we didn't create a new backup
  // Use the latest backup path if available
  storeOriginalConfig(resolvedFilePath, content, latestBackupPath);
  return null;
}

export function updateConfigFile(
  originalConfig,
  _selectedServiceNames,
  resolvedFilePath,
  content,
  mcpSharkLogs,
  broadcastLogUpdate
) {
  const [serverObject, serverType] = getServerObject(originalConfig);
  const updatedConfig = { ...originalConfig };

  if (serverObject) {
    const updatedServers = {};
    // Transform all original servers to HTTP URLs pointing to MCP shark server
    // Each server gets its own endpoint to avoid tool name prefixing issues
    Object.entries(serverObject).forEach(([name, _cfg]) => {
      updatedServers[name] = {
        type: 'http',
        url: `http://localhost:9851/mcp/${encodeURIComponent(name)}`,
      };
    });
    updatedConfig[serverType] = updatedServers;
  }

  const createdBackupPath = computeBackupPath(
    resolvedFilePath,
    content,
    mcpSharkLogs,
    broadcastLogUpdate
  );

  if (resolvedFilePath && fs.existsSync(resolvedFilePath)) {
    fs.writeFileSync(resolvedFilePath, JSON.stringify(updatedConfig, null, 2));
    logger.info({ path: resolvedFilePath }, 'Updated config file');
  }

  return { updatedConfig, backupPath: createdBackupPath };
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

function getServerObject(originalConfig) {
  const hasMcpServers = originalConfig.mcpServers && typeof originalConfig.mcpServers === 'object';
  const hasServers = originalConfig.servers && typeof originalConfig.servers === 'object';

  if (hasMcpServers) {
    return [originalConfig.mcpServers, 'mcpServers'];
  }

  if (hasServers) {
    return [originalConfig.servers, 'servers'];
  }

  return [null, null];
}

export function formatDateTimeForBackup() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}
