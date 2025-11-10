import * as path from 'node:path';
import * as fs from 'node:fs';
import { homedir } from 'node:os';
import { extractServices, convertMcpServersToServers } from '../utils/config.js';

export function createConfigRoutes() {
  const router = {};

  router.extractServices = (req, res) => {
    try {
      const { filePath, fileContent } = req.body;

      if (!filePath && !fileContent) {
        return res.status(400).json({ error: 'Either filePath or fileContent is required' });
      }

      const content = fileContent
        ? fileContent
        : (() => {
            const resolvedFilePath = filePath.startsWith('~')
              ? path.join(homedir(), filePath.slice(1))
              : filePath;

            if (!fs.existsSync(resolvedFilePath)) {
              return null;
            }
            return fs.readFileSync(resolvedFilePath, 'utf-8');
          })();

      if (!content) {
        const resolvedFilePath = filePath.startsWith('~')
          ? path.join(homedir(), filePath.slice(1))
          : filePath;
        return res.status(404).json({ error: 'File not found', path: resolvedFilePath });
      }

      const parseResult = (() => {
        try {
          return { config: JSON.parse(content), error: null };
        } catch (e) {
          return { config: null, error: e };
        }
      })();

      if (!parseResult.config) {
        return res.status(400).json({
          error: 'Invalid JSON file',
          details: parseResult.error ? parseResult.error.message : 'Failed to parse JSON',
        });
      }

      const config = parseResult.config;

      const services = extractServices(config);
      res.json({ success: true, services });
    } catch (error) {
      res.status(500).json({ error: 'Failed to extract services', details: error.message });
    }
  };

  router.readConfig = (req, res) => {
    try {
      const { filePath } = req.query;

      if (!filePath) {
        return res.status(400).json({ error: 'filePath is required' });
      }

      const resolvedPath = filePath.startsWith('~')
        ? path.join(homedir(), filePath.slice(1))
        : filePath;

      if (!fs.existsSync(resolvedPath)) {
        return res.status(404).json({ error: 'File not found', path: resolvedPath });
      }

      const content = fs.readFileSync(resolvedPath, 'utf-8');
      const parsed = (() => {
        try {
          return JSON.parse(content);
        } catch (e) {
          return null;
        }
      })();

      res.json({
        success: true,
        filePath: resolvedPath,
        displayPath: resolvedPath.replace(homedir(), '~'),
        content: content,
        parsed: parsed,
        exists: true,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to read file', details: error.message });
    }
  };

  router.detectConfig = (req, res) => {
    const detected = [];
    const platform = process.platform;
    const homeDir = homedir();

    const cursorPaths = [
      path.join(homeDir, '.cursor', 'mcp.json'),
      ...(platform === 'win32'
        ? [path.join(process.env.USERPROFILE || '', '.cursor', 'mcp.json')]
        : []),
    ];

    const windsurfPaths = [
      path.join(homeDir, '.codeium', 'windsurf', 'mcp_config.json'),
      ...(platform === 'win32'
        ? [path.join(process.env.USERPROFILE || '', '.codeium', 'windsurf', 'mcp_config.json')]
        : []),
    ];

    for (const cursorPath of cursorPaths) {
      if (fs.existsSync(cursorPath)) {
        detected.push({
          editor: 'Cursor',
          path: cursorPath,
          displayPath: cursorPath.replace(homeDir, '~'),
          exists: true,
        });
        break;
      }
    }

    for (const windsurfPath of windsurfPaths) {
      if (fs.existsSync(windsurfPath)) {
        detected.push({
          editor: 'Windsurf',
          path: windsurfPath,
          displayPath: windsurfPath.replace(homeDir, '~'),
          exists: true,
        });
        break;
      }
    }

    const defaultPaths = [
      {
        editor: 'Cursor',
        path: path.join(homeDir, '.cursor', 'mcp.json'),
        displayPath: '~/.cursor/mcp.json',
        exists: fs.existsSync(path.join(homeDir, '.cursor', 'mcp.json')),
      },
      {
        editor: 'Windsurf',
        path: path.join(homeDir, '.codeium', 'windsurf', 'mcp_config.json'),
        displayPath: '~/.codeium/windsurf/mcp_config.json',
        exists: fs.existsSync(path.join(homeDir, '.codeium', 'windsurf', 'mcp_config.json')),
      },
    ];

    const result = detected.length > 0 ? detected : defaultPaths;

    res.json({
      detected: result,
      platform,
      homeDir,
    });
  };

  router.listBackups = (req, res) => {
    try {
      const backups = [];
      const homeDir = homedir();

      const commonPaths = [
        path.join(homeDir, '.cursor', 'mcp.json'),
        path.join(homeDir, '.codeium', 'windsurf', 'mcp_config.json'),
      ];

      commonPaths.forEach((configPath) => {
        const backupPath = `${configPath}.backup`;
        if (fs.existsSync(backupPath)) {
          const stats = fs.statSync(backupPath);
          backups.push({
            originalPath: configPath,
            backupPath: backupPath,
            createdAt: stats.birthtime.toISOString(),
            size: stats.size,
            displayPath: configPath.replace(homeDir, '~'),
          });
        }
      });

      const backupDirs = [
        path.join(homeDir, '.cursor'),
        path.join(homeDir, '.codeium', 'windsurf'),
      ];

      backupDirs.forEach((dir) => {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          files
            .filter((file) => file.endsWith('.backup'))
            .forEach((file) => {
              const backupPath = path.join(dir, file);
              const originalPath = backupPath.replace('.backup', '');
              if (!backups.find((b) => b.backupPath === backupPath)) {
                const stats = fs.statSync(backupPath);
                backups.push({
                  originalPath: originalPath,
                  backupPath: backupPath,
                  createdAt: stats.birthtime.toISOString(),
                  size: stats.size,
                  displayPath: originalPath.replace(homeDir, '~'),
                });
              }
            });
        }
      });

      res.json({ backups: backups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) });
    } catch (error) {
      res.status(500).json({ error: 'Failed to list backups', details: error.message });
    }
  };

  router.restoreBackup = (req, res, mcpSharkLogs, broadcastLogUpdate) => {
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

      const originalPath = resolvedBackupPath.replace('.backup', '');
      const backupContent = fs.readFileSync(resolvedBackupPath, 'utf8');
      fs.writeFileSync(originalPath, backupContent);

      const timestamp = new Date().toISOString();
      const restoreLog = {
        timestamp,
        type: 'stdout',
        line: `[RESTORE] Restored config from backup: ${originalPath.replace(homedir(), '~')}`,
      };
      mcpSharkLogs.push(restoreLog);
      if (mcpSharkLogs.length > 10000) {
        mcpSharkLogs.shift();
      }
      broadcastLogUpdate(restoreLog);

      res.json({
        success: true,
        message: 'Config file restored from backup',
        originalPath: originalPath.replace(homedir(), '~'),
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

  return router;
}
