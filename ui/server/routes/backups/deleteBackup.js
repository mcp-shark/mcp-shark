import * as fs from 'node:fs';
import { homedir } from 'node:os';
import * as path from 'node:path';
import { Defaults, HttpStatus } from '#core/constants';

export function deleteBackup(req, res, mcpSharkLogs, broadcastLogUpdate) {
  try {
    const { backupPath } = req.body;

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

    fs.unlinkSync(resolvedBackupPath);

    const timestamp = new Date().toISOString();
    const deleteLog = {
      timestamp,
      type: 'stdout',
      line: `[DELETE] Deleted backup: ${resolvedBackupPath.replace(homedir(), '~')}`,
    };
    mcpSharkLogs.push(deleteLog);
    if (mcpSharkLogs.length > Defaults.MAX_LOG_LINES) {
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
    if (mcpSharkLogs.length > Defaults.MAX_LOG_LINES) {
      mcpSharkLogs.shift();
    }
    broadcastLogUpdate(errorLog);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to delete backup', details: error.message });
  }
}
