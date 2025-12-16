import * as fs from 'node:fs';
import { homedir } from 'node:os';
import * as path from 'node:path';

export function listBackups(_req, res) {
  try {
    const backups = [];
    const homeDir = homedir();

    const commonPaths = [
      path.join(homeDir, '.cursor', 'mcp.json'),
      path.join(homeDir, '.codeium', 'windsurf', 'mcp_config.json'),
    ];

    const backupDirs = [path.join(homeDir, '.cursor'), path.join(homeDir, '.codeium', 'windsurf')];

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
}
