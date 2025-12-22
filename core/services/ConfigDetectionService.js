import * as fs from 'node:fs';
import { homedir } from 'node:os';
import * as path from 'node:path';
import { getCodexConfigPath } from '#common/configs';

/**
 * Service for detecting configuration files on the system
 */
export class ConfigDetectionService {
  /**
   * Detect config files on the system
   */
  detectConfigFiles() {
    const detected = [];
    const homeDir = homedir();
    const platform = process.platform;

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

    const codexPath = getCodexConfigPath();
    if (fs.existsSync(codexPath)) {
      detected.push({
        editor: 'Codex',
        path: codexPath,
        displayPath: codexPath.replace(homeDir, '~'),
        exists: true,
      });
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
      {
        editor: 'Codex',
        path: codexPath,
        displayPath: codexPath.replace(homeDir, '~'),
        exists: fs.existsSync(codexPath),
      },
    ];

    return detected.length > 0 ? detected : defaultPaths;
  }
}
