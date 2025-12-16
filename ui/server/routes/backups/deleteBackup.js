import * as fs from 'node:fs';
import { homedir } from 'node:os';
import * as path from 'node:path';

export function deleteBackup(req, res, mcpSharkLogs, broadcastLogUpdate) {
  try {
    const { backupPath } = req.body;

    if (!backupPath) {
      return res.status(400).json({ error: 'backupPath is required' });
    }

    const resolvedBackupPath = backupPath.startsWith('~')
      ? path.join(homedir(), backupPath.slice(1))
      : backupPath;

    if (!fs.existsSync(resolvedBackupPath)) {
      return res.status(404).json({ error: 'Backup file not found', path: resolvedBackupPath });
    }

    fs.unlinkSync(resolvedBackupPath);

    const timestamp = new Date().toISOString();
    const deleteLog = {
      timestamp,
      type: 'stdout',
      line: `[DELETE] Deleted backup: ${resolvedBackupPath.replace(homedir(), '~')}`,
    };
    mcpSharkLogs.push(deleteLog);
    if (mcpSharkLogs.length > 10000) {
      mcpSharkLogs.shift();
    }
    broadcastLogUpdate(deleteLog);

    res.json({
      success: true,
      message: 'Backup file deleted successfully',
      backupPath: resolvedBackupPath.replace(homedir(), '~'),
    });
  } catch (error) {
    const timestamp = new Date().toISOString();
    const errorLog = {
      timestamp,
      type: 'error',
      line: `[DELETE ERROR] Failed to delete backup: ${error.message}`,
    };
    mcpSharkLogs.push(errorLog);
    if (mcpSharkLogs.length > 10000) {
      mcpSharkLogs.shift();
    }
    broadcastLogUpdate(errorLog);
    res.status(500).json({ error: 'Failed to delete backup', details: error.message });
  }
}
