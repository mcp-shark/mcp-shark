import * as fs from 'node:fs';
import { homedir } from 'node:os';
import * as path from 'node:path';
import { Defaults, HttpStatus } from '#core/constants';

export function restoreBackup(req, res, mcpSharkLogs, broadcastLogUpdate) {
  try {
    const { backupPath, originalPath } = req.body;

    if (!backupPath) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: 'backupPath is required' });
    }

    const resolvedBackupPath = backupPath.startsWith('~')
      ? path.join(homedir(), backupPath.slice(1))
      : backupPath;

    if (!fs.existsSync(resolvedBackupPath)) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ error: 'Backup file not found', path: resolvedBackupPath });
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
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: 'Could not determine original file path' });
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
    if (mcpSharkLogs.length > Defaults.MAX_LOG_LINES) {
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
    if (mcpSharkLogs.length > Defaults.MAX_LOG_LINES) {
      mcpSharkLogs.shift();
    }
    broadcastLogUpdate(errorLog);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to restore backup', details: error.message });
  }
}
