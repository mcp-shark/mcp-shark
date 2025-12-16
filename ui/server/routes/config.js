import * as fs from 'node:fs';
import { homedir } from 'node:os';
import * as path from 'node:path';
import { extractServices } from '../utils/config.js';
import { createBackupRoutes } from './backups.js';

function readFileContent(filePath) {
  const resolvedFilePath = filePath.startsWith('~')
    ? path.join(homedir(), filePath.slice(1))
    : filePath;

  if (!fs.existsSync(resolvedFilePath)) {
    return null;
  }
  return fs.readFileSync(resolvedFilePath, 'utf-8');
}

function parseJsonSafely(content) {
  try {
    return { config: JSON.parse(content), error: null };
  } catch (e) {
    return { config: null, error: e };
  }
}

function tryParseJson(content) {
  try {
    return JSON.parse(content);
  } catch (_e) {
    return null;
  }
}

export function createConfigRoutes() {
  const router = {};

  router.extractServices = (req, res) => {
    try {
      const { filePath, fileContent } = req.body;

      if (!filePath && !fileContent) {
        return res.status(400).json({ error: 'Either filePath or fileContent is required' });
      }

      const content = fileContent ? fileContent : readFileContent(filePath);

      if (!content) {
        const resolvedFilePath = filePath.startsWith('~')
          ? path.join(homedir(), filePath.slice(1))
          : filePath;
        return res.status(404).json({ error: 'File not found', path: resolvedFilePath });
      }

      const parseResult = parseJsonSafely(content);

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
      const parsed = tryParseJson(content);

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

  router.detectConfig = (_req, res) => {
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

  // Delegate backup routes to separate module
  const backupRoutes = createBackupRoutes();
  router.listBackups = backupRoutes.listBackups;
  router.restoreBackup = backupRoutes.restoreBackup;
  router.viewBackup = backupRoutes.viewBackup;
  router.deleteBackup = backupRoutes.deleteBackup;

  return router;
}
