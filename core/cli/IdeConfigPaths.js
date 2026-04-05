/**
 * IDE configuration paths for MCP server detection
 * Maps IDE names to their known config file locations across platforms
 */
import { homedir } from 'node:os';
import { join } from 'node:path';
import { Environment } from '#core/configs/environment.js';

const HOME = homedir();
const PLATFORM = process.platform;

function macAppSupport(appName) {
  return join(HOME, 'Library', 'Application Support', appName);
}

function winAppData(appName) {
  const appData = process.env.APPDATA || join(Environment.getUserProfile(), 'AppData', 'Roaming');
  return join(appData, appName);
}

function linuxConfig(appName) {
  const xdgConfig = process.env.XDG_CONFIG_HOME || join(HOME, '.config');
  return join(xdgConfig, appName);
}

/**
 * Build platform-aware config paths for an IDE
 */
function buildPaths(mac, win, linux) {
  const paths = [];
  if (PLATFORM === 'darwin' && mac) {
    paths.push(...(Array.isArray(mac) ? mac : [mac]));
  }
  if (PLATFORM === 'win32' && win) {
    paths.push(...(Array.isArray(win) ? win : [win]));
  }
  if (PLATFORM === 'linux' && linux) {
    paths.push(...(Array.isArray(linux) ? linux : [linux]));
  }
  return paths;
}

/**
 * All known IDE config definitions
 * Each entry: { name, paths: string[], parser: 'json' | 'toml' | 'jsonEmbedded' }
 */
export const IDE_CONFIGS = [
  {
    name: 'Cursor',
    parser: 'json',
    paths: [
      join(HOME, '.cursor', 'mcp.json'),
      join(process.cwd(), '.cursor', 'mcp.json'),
      ...buildPaths(null, join(Environment.getUserProfile(), '.cursor', 'mcp.json'), null),
    ],
  },
  {
    name: 'Claude Desktop',
    parser: 'json',
    paths: buildPaths(
      join(macAppSupport('Claude'), 'claude_desktop_config.json'),
      join(winAppData('Claude'), 'claude_desktop_config.json'),
      join(linuxConfig('Claude'), 'claude_desktop_config.json')
    ),
  },
  {
    name: 'Claude Code',
    parser: 'json',
    paths: [join(HOME, '.claude.json'), join(HOME, '.claude', 'settings.json')],
  },
  {
    name: 'VS Code',
    parser: 'json',
    paths: [join(process.cwd(), '.vscode', 'mcp.json'), join(HOME, '.vscode', 'mcp.json')],
  },
  {
    name: 'Windsurf',
    parser: 'json',
    paths: [
      join(HOME, '.codeium', 'windsurf', 'mcp_config.json'),
      ...buildPaths(
        null,
        join(Environment.getUserProfile(), '.codeium', 'windsurf', 'mcp_config.json'),
        null
      ),
    ],
  },
  {
    name: 'Codex',
    parser: 'toml',
    paths: [
      join(Environment.getCodexHome(), 'config.toml'),
      join(HOME, '.codex', 'config.toml'),
      ...buildPaths(null, join(Environment.getUserProfile(), '.codex', 'config.toml'), null),
    ],
  },
  {
    name: 'Gemini CLI',
    parser: 'jsonEmbedded',
    paths: [join(HOME, '.gemini', 'settings.json')],
  },
  {
    name: 'Continue',
    parser: 'jsonEmbedded',
    paths: [join(HOME, '.continue', 'config.json')],
  },
  {
    name: 'Cline',
    parser: 'json',
    paths: buildPaths(
      join(
        macAppSupport('Code'),
        'User',
        'globalStorage',
        'saoudrizwan.claude-dev',
        'settings',
        'cline_mcp_settings.json'
      ),
      join(
        winAppData('Code'),
        'User',
        'globalStorage',
        'saoudrizwan.claude-dev',
        'settings',
        'cline_mcp_settings.json'
      ),
      join(
        linuxConfig('Code'),
        'User',
        'globalStorage',
        'saoudrizwan.claude-dev',
        'settings',
        'cline_mcp_settings.json'
      )
    ),
  },
  {
    name: 'Amp',
    parser: 'json',
    paths: [join(HOME, '.amp', 'mcp.json')],
  },
  {
    name: 'Kiro',
    parser: 'json',
    paths: [join(HOME, '.kiro', 'mcp.json')],
  },
  {
    name: 'Zed',
    parser: 'jsonEmbedded',
    paths: buildPaths(
      join(HOME, '.config', 'zed', 'settings.json'),
      null,
      join(linuxConfig('zed'), 'settings.json')
    ),
  },
  {
    name: 'Augment',
    parser: 'json',
    paths: [join(HOME, '.augment', 'mcp.json')],
  },
  {
    name: 'Roo Code',
    parser: 'json',
    paths: [join(HOME, '.roo-code', 'mcp.json')],
  },
  {
    name: 'Project',
    parser: 'json',
    paths: [
      join(process.cwd(), 'mcp.json'),
      join(process.cwd(), '.mcp.json'),
      join(process.cwd(), '.mcp', 'config.json'),
    ],
  },
];
