import * as fs from 'node:fs';
import { homedir } from 'node:os';
import * as path from 'node:path';
import { HttpStatus } from '#core/constants';

function tryParseJson(content) {
  try {
    return JSON.parse(content);
  } catch (_e) {
    return null;
  }
}

export function viewBackup(req, res) {
  try {
    const { backupPath } = req.query;

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

    const content = fs.readFileSync(resolvedBackupPath, 'utf-8');
    const parsed = tryParseJson(content);

    const stats = fs.statSync(resolvedBackupPath);

    res.json({
      success: true,
      backupPath: resolvedBackupPath,
      displayPath: resolvedBackupPath.replace(homedir(), '~'),
      content: content,
      parsed: parsed,
      createdAt: stats.birthtime.toISOString(),
      modifiedAt: stats.mtime.toISOString(),
      size: stats.size,
    });
  } catch (error) {
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to read backup file', details: error.message });
  }
}
