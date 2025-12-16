import * as fs from 'node:fs';
import { homedir } from 'node:os';
import * as path from 'node:path';

function tryParseJson(content) {
  try {
    return JSON.parse(content);
  } catch (_e) {
    return null;
  }
}

export function createBackupRoutes() {
  const router = {};

  router.listBackups = (_req, res) => {
    try {
      const backups = [];
      const homeDir = homedir();

      const commonPaths = [
        path.join(homeDir, '.cursor', 'mcp.json'),
        path.join(homeDir, '.codeium', 'windsurf', 'mcp_config.json'),
      ];

      const backupDirs = [
        path.join(homeDir, '.cursor'),
        path.join(homeDir, '.codeium', 'windsurf'),
      ];

      // Find backups with new format: .mcp.json-mcpshark.<datetime>.json
      backupDirs.forEach((dir) => {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          files
            .filter((file) => {
              // Match pattern: .<basename>-mcpshark.<datetime>.json
              return /^\.(.+)-mcpshark\.\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.json$/.test(file);
            })
            .forEach((file) => {
              const backupPath = path.join(dir, file);
              // Extract original filename from backup name
              // .mcp.json-mcpshark.<datetime>.json -> mcp.json
              const match = file.match(/^\.(.+)-mcpshark\./);
              if (match) {
                const originalBasename = match[1];
                const originalPath = path.join(dir, originalBasename);
                const stats = fs.statSync(backupPath);
                backups.push({
                  originalPath: originalPath,
                  backupPath: backupPath,
                  createdAt: stats.birthtime.toISOString(),
                  modifiedAt: stats.mtime.toISOString(),
                  size: stats.size,
                  displayPath: originalPath.replace(homeDir, '~'),
                  backupFileName: file,
                });
              }
            });
        }
      });

      // Also check for old .backup format for backward compatibility
      commonPaths.forEach((configPath) => {
        const backupPath = `${configPath}.backup`;
        if (fs.existsSync(backupPath)) {
          const stats = fs.statSync(backupPath);
          backups.push({
            originalPath: configPath,
            backupPath: backupPath,
            createdAt: stats.birthtime.toISOString(),
            modifiedAt: stats.mtime.toISOString(),
            size: stats.size,
            displayPath: configPath.replace(homeDir, '~'),
            backupFileName: path.basename(backupPath),
          });
        }
      });

      // Sort by modifiedAt (latest first)
      res.json({
        backups: backups.sort(
          (a, b) => new Date(b.modifiedAt || b.createdAt) - new Date(a.modifiedAt || a.createdAt)
        ),
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to list backups', details: error.message });
    }
  };

  router.restoreBackup = (req, res, mcpSharkLogs, broadcastLogUpdate) => {
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
  };

  router.viewBackup = (req, res) => {
    try {
      const { backupPath } = req.query;

      if (!backupPath) {
        return res.status(400).json({ error: 'backupPath is required' });
      }

      const resolvedBackupPath = backupPath.startsWith('~')
        ? path.join(homedir(), backupPath.slice(1))
        : backupPath;

      if (!fs.existsSync(resolvedBackupPath)) {
        return res.status(404).json({ error: 'Backup file not found', path: resolvedBackupPath });
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
      res.status(500).json({ error: 'Failed to read backup file', details: error.message });
    }
  };

  router.deleteBackup = (req, res, mcpSharkLogs, broadcastLogUpdate) => {
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
  };

  return router;
}
