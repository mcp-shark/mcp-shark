import * as fs from 'node:fs';
import * as path from 'node:path';
import { homedir } from 'node:os';
import { storeOriginalConfig } from './config.js';

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
    console.error('Error finding latest backup:', error);
    return null;
  }
}

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

  let createdBackupPath = null;
  if (resolvedFilePath && fs.existsSync(resolvedFilePath)) {
    // Check if we need to create a backup by comparing with latest backup
    const latestBackupPath = findLatestBackup(resolvedFilePath);
    let shouldCreateBackup = true;

    if (latestBackupPath && fs.existsSync(latestBackupPath)) {
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
          shouldCreateBackup = false;
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
        }
      } catch (error) {
        console.error('Error comparing with latest backup:', error);
        // If comparison fails, create backup to be safe
        shouldCreateBackup = true;
      }
    }

    if (shouldCreateBackup) {
      // Create backup with new format: .mcp.json-mcpshark.<datetime>.json
      const now = new Date();
      // Format: YYYY-MM-DD_HH-MM-SS
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const datetimeStr = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
      const dir = path.dirname(resolvedFilePath);
      const basename = path.basename(resolvedFilePath);
      createdBackupPath = path.join(dir, `.${basename}-mcpshark.${datetimeStr}.json`);
      fs.copyFileSync(resolvedFilePath, createdBackupPath);
      storeOriginalConfig(resolvedFilePath, content, createdBackupPath);

      const timestamp = new Date().toISOString();
      const backupLog = {
        timestamp,
        type: 'stdout',
        line: `[BACKUP] Created backup: ${createdBackupPath.replace(homedir(), '~')}`,
      };
      mcpSharkLogs.push(backupLog);
      if (mcpSharkLogs.length > 10000) {
        mcpSharkLogs.shift();
      }
      broadcastLogUpdate(backupLog);
    } else {
      // Still store the original config reference even if we didn't create a new backup
      // Use the latest backup path if available
      storeOriginalConfig(resolvedFilePath, content, latestBackupPath);
    }

    fs.writeFileSync(resolvedFilePath, JSON.stringify(updatedConfig, null, 2));
    console.log(`Updated config file: ${resolvedFilePath}`);
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
