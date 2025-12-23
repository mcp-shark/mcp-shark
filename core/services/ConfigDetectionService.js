import * as fs from 'node:fs';
import { homedir } from 'node:os';
import * as path from 'node:path';
import { Environment } from '#core/configs/environment.js';

const cursorDefaultPath = path.join(homedir(), '.cursor', 'mcp.json');
const windsurfDefaultPath = path.join(homedir(), '.codeium', 'windsurf', 'mcp_config.json');
const codexDefaultPath = path.join(homedir(), '.codex', 'config.toml');

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
      cursorDefaultPath,
      ...(platform === 'win32'
        ? [path.join(Environment.getUserProfile(), '.cursor', 'mcp.json')]
        : []),
    ];

    const windsurfPaths = [
      windsurfDefaultPath,
      ...(platform === 'win32'
        ? [path.join(Environment.getUserProfile(), '.codeium', 'windsurf', 'mcp_config.json')]
        : []),
    ];

    const codexPaths = [
      codexDefaultPath,
      path.join(Environment.getCodexHome(), 'config.toml'),
      ...(platform === 'win32'
        ? [path.join(Environment.getUserProfile(), '.codex', 'config.toml')]
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

    for (const codexPath of codexPaths) {
      if (fs.existsSync(codexPath)) {
        detected.push({
          editor: 'Codex',
          path: codexPath,
          displayPath: codexPath.replace(homeDir, '~'),
          exists: true,
        });
      }
    }

    const defaultPaths = [
      {
        editor: 'Cursor',
        path: cursorDefaultPath.replace(homeDir, '~'),
        displayPath: cursorDefaultPath.replace(homeDir, '~'),
        exists: fs.existsSync(cursorDefaultPath),
      },
      {
        editor: 'Windsurf',
        path: windsurfDefaultPath.replace(homeDir, '~'),
        displayPath: windsurfDefaultPath.replace(homeDir, '~'),
        exists: fs.existsSync(windsurfDefaultPath),
      },
      {
        editor: 'Codex',
        path: codexDefaultPath.replace(homeDir, '~'),
        displayPath: codexDefaultPath.replace(homeDir, '~'),
        exists: fs.existsSync(codexDefaultPath),
      },
    ];

    return detected.length > 0 ? detected : defaultPaths;
  }
}
