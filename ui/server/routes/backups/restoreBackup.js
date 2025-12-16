import * as fs from 'node:fs';
import { homedir } from 'node:os';
import * as path from 'node:path';

export function restoreBackup(req, res, mcpSharkLogs, broadcastLogUpdate) {
  try {
    const { backupPath, originalPath } = req.body;

    if (!backupPath) {
      return res.status(400).json({ error: 'backupPath is required' });
    }

    const resolvedBackupPath = backupPath.startsWith('~')
      ? path.join(homedir(), backupPath.slice(1))
      : backupPath;

    if (!fs.existsSync(resolvedBackupPath)) {
      return res.status(404).json({ error: 'Backup file not found', path: resolvedBackupPath });
    }

    // Determine original path
    const determineTargetPath = (originalPath, backupPath) => {
      if (originalPath) {
        return originalPath.startsWith('~')
          ? path.join(homedir(), originalPath.slice(1))
          : originalPath;
      }

      // Try to extract from backup filename
      if (backupPath.endsWith('.backup')) {
        return backupPath.replace('.backup', '');
      }

      // New format: .mcp.json-mcpshark.<datetime>.json
      const match = path.basename(backupPath).match(/^\.(.+)-mcpshark\./);
      if (match) {
        const originalBasename = match[1];
        return path.join(path.dirname(backupPath), originalBasename);
      }

      return null;
    };

    const targetPath = determineTargetPath(originalPath, resolvedBackupPath);
    if (!targetPath) {
      return res.status(400).json({ error: 'Could not determine original file path' });
    }

    const backupContent = fs.readFileSync(resolvedBackupPath, 'utf8');
    fs.writeFileSync(targetPath, backupContent);

    const timestamp = new Date().toISOString();
    const restoreLog = {
      timestamp,
      type: 'stdout',
      line: `[RESTORE] Restored config from backup: ${targetPath.replace(homedir(), '~')}`,
    };
    mcpSharkLogs.push(restoreLog);
    if (mcpSharkLogs.length > 10000) {
      mcpSharkLogs.shift();
    }
    broadcastLogUpdate(restoreLog);

    res.json({
      success: true,
      message: 'Config file restored from backup',
      originalPath: targetPath.replace(homedir(), '~'),
    });
  } catch (error) {
    const timestamp = new Date().toISOString();
    const errorLog = {
      timestamp,
      type: 'error',
      line: `[RESTORE ERROR] Failed to restore: ${error.message}`,
    };
    mcpSharkLogs.push(errorLog);
    if (mcpSharkLogs.length > 10000) {
      mcpSharkLogs.shift();
    }
    broadcastLogUpdate(errorLog);
    res.status(500).json({ error: 'Failed to restore backup', details: error.message });
  }
}
