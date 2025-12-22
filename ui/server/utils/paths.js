import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getNvmNodeBinPaths(homeDir) {
  try {
    const nvmVersionsPath = path.join(homeDir, '.nvm', 'versions', 'node');
    if (fs.existsSync(nvmVersionsPath)) {
      return fs
        .readdirSync(nvmVersionsPath, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => path.join(nvmVersionsPath, dirent.name, 'bin'));
    }
  } catch (_e) {}
  return [];
}

export function findMcpServerPath() {
  const pathsToCheck = [
    path.join(process.cwd(), '../mcp-server'),
    path.join(__dirname, '../../mcp-server'),
    path.join(process.cwd(), 'mcp-server'),
    path.join(__dirname, '../../mcp-server'),
  ];

  for (const possiblePath of pathsToCheck) {
    if (fs.existsSync(possiblePath)) {
      return possiblePath;
    }
  }

  return path.join(process.cwd(), '../mcp-server');
}

function getPathOutput(shell, shellName) {
  const execOptions = {
    encoding: 'utf8',
    timeout: 2000,
    stdio: ['ignore', 'pipe', 'ignore'],
    maxBuffer: 1024 * 1024,
    env: {
      ...Object.fromEntries(Object.entries(process.env).filter(([key]) => key !== 'PATH')),
    },
  };

  if (shellName === 'zsh') {
    try {
      return execSync(`${shell} -i -c 'echo $PATH'`, execOptions);
    } catch (_e) {
      return execSync(`${shell} -l -c 'echo $PATH'`, execOptions);
    }
  }

  return execSync(`${shell} -l -c 'echo $PATH'`, execOptions);
}

/**
 * Get system PATH from the host machine's shell environment
 * This works in Electron by executing a shell command to get the actual PATH
 * Includes both system PATH and user's custom PATH from shell config files
 */
function getSystemPath() {
  try {
    if (process.platform === 'win32') {
      const pathOutput = execSync('cmd /c echo %PATH%', {
        encoding: 'utf8',
        timeout: 2000,
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      return pathOutput.trim();
    }
    const userShell = process.env.SHELL || '/bin/zsh';
    const shells = [userShell, '/bin/zsh', '/bin/bash', '/bin/sh'];

    for (const shell of shells) {
      if (fs.existsSync(shell)) {
        try {
          const shellName = path.basename(shell);
          const pathOutput = getPathOutput(shell, shellName);
          const systemPath = pathOutput.trim();
          if (systemPath) {
            logger.info({ shell, shellName }, 'Got PATH from shell');
            return systemPath;
          }
        } catch (_e) {}
      }
    }

    const homeDir = os.homedir();
    const configFiles = [
      { file: path.join(homeDir, '.zshrc'), shell: 'zsh', interactive: true },
      { file: path.join(homeDir, '.zprofile'), shell: 'zsh', interactive: false },
      { file: path.join(homeDir, '.zlogin'), shell: 'zsh', interactive: false },
      { file: path.join(homeDir, '.bashrc'), shell: 'bash', interactive: true },
      { file: path.join(homeDir, '.bash_profile'), shell: 'bash', interactive: false },
      { file: path.join(homeDir, '.profile'), shell: 'sh', interactive: false },
    ];

    for (const { file, shell: shellName, interactive } of configFiles) {
      if (fs.existsSync(file)) {
        try {
          const flag = shellName === 'zsh' && interactive ? '-i' : '';
          const pathOutput = execSync(
            `/bin/${shellName} ${flag} -c 'source ${file} 2>/dev/null; echo $PATH'`,
            {
              encoding: 'utf8',
              timeout: 2000,
              stdio: ['ignore', 'pipe', 'ignore'],
              maxBuffer: 1024 * 1024,
              env: {
                ...Object.fromEntries(
                  Object.entries(process.env).filter(([key]) => key !== 'PATH')
                ),
              },
            }
          );
          const systemPath = pathOutput.trim();
          if (systemPath && systemPath.length > 10) {
            logger.info({ file }, 'Got PATH from file');
            return systemPath;
          }
        } catch (_e) {}
      }
    }
  } catch (error) {
    logger.warn({ error: error.message }, 'Could not get system PATH');
  }
  return null;
}

/**
 * Enhance PATH environment variable to include system paths and user paths
 * This is especially important in Electron where PATH might not include system executables
 */
export function enhancePath(originalPath) {
  const homeDir = os.homedir();
  const pathSeparator = process.platform === 'win32' ? ';' : ':';

  const systemPath = getSystemPath();
  if (systemPath) {
    logger.info('Using system PATH from host machine');
    const userPaths = [
      path.join(homeDir, '.local', 'bin'),
      path.join(homeDir, '.npm-global', 'bin'),
      path.join(homeDir, '.cargo', 'bin'),
      path.join(homeDir, 'bin'),
      path.join(homeDir, '.nvm', 'current', 'bin'),
      ...getNvmNodeBinPaths(homeDir),
      path.join(homeDir, '.fnm', 'node-versions', 'v20.0.0', 'install', 'bin'),
      path.join(homeDir, '.pyenv', 'shims'),
      path.join(homeDir, '.pyenv', 'bin'),
      path.join(homeDir, '.gvm', 'bin'),
      path.join(homeDir, '.gvm', 'gos', 'current', 'bin'),
      path.join(homeDir, '.cargo', 'bin'),
      path.join(homeDir, 'go', 'bin'),
      path.join(homeDir, '.go', 'bin'),
      '/Applications/iTerm.app/Contents/Resources/utilities',
      ...(process.platform === 'win32'
        ? [
            path.join(homeDir, 'AppData', 'Local', 'Programs'),
            path.join(homeDir, 'AppData', 'Roaming', 'npm'),
            path.join(homeDir, 'AppData', 'Local', 'Microsoft', 'WindowsApps'),
          ]
        : []),
    ].filter((p) => {
      if (p.includes('v20.0.0') || p.includes('current')) {
        return fs.existsSync(path.dirname(p));
      }
      return fs.existsSync(p);
    });

    return [systemPath, ...userPaths, originalPath || ''].filter((p) => p).join(pathSeparator);
  }

  logger.info('Could not get system PATH, adding common locations');
  const pathsToAdd = [
    '/usr/local/bin',
    '/usr/bin',
    '/opt/homebrew/bin',
    '/usr/local/opt/node/bin',
    '/opt/local/bin',
    '/sbin',
    '/usr/sbin',
    ...(process.platform === 'darwin'
      ? [
          '/opt/homebrew/opt/python/bin',
          '/usr/local/opt/python/bin',
          '/Applications/Docker.app/Contents/Resources/bin',
        ]
      : []),
    ...(process.platform === 'linux' ? ['/snap/bin', path.join(homeDir, '.local', 'bin')] : []),
    ...(process.platform === 'win32'
      ? [
          path.join(process.env.ProgramFiles || '', 'nodejs'),
          path.join(process.env['ProgramFiles(x86)'] || '', 'nodejs'),
          path.join(homeDir, 'AppData', 'Roaming', 'npm'),
          path.join(process.env.ProgramFiles || '', 'Docker', 'Docker', 'resources', 'bin'),
        ]
      : []),
    path.join(homeDir, '.local', 'bin'),
    path.join(homeDir, '.npm-global', 'bin'),
    path.join(homeDir, '.cargo', 'bin'),
    path.join(homeDir, 'bin'),
    path.join(homeDir, '.nvm', 'current', 'bin'),
    ...getNvmNodeBinPaths(homeDir),
    path.join(homeDir, '.pyenv', 'shims'),
    path.join(homeDir, '.pyenv', 'bin'),
    path.join(homeDir, '.gvm', 'bin'),
    path.join(homeDir, '.gvm', 'gos', 'current', 'bin'),
    path.join(homeDir, 'go', 'bin'),
    path.join(homeDir, '.go', 'bin'),
    '/Applications/iTerm.app/Contents/Resources/utilities',
    ...(process.platform === 'win32'
      ? [
          path.join(homeDir, 'AppData', 'Local', 'Programs'),
          path.join(homeDir, 'AppData', 'Local', 'Microsoft', 'WindowsApps'),
        ]
      : []),
  ].filter((p) => p && fs.existsSync(p));

  return [...pathsToAdd, originalPath || ''].filter((p) => p).join(pathSeparator);
}
