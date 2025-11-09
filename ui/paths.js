import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Get system PATH from the host machine's shell environment
 * This works in Electron by executing a shell command to get the actual PATH
 * Includes both system PATH and user's custom PATH from shell config files
 */
function getSystemPath() {
  try {
    if (process.platform === 'win32') {
      // Windows: use cmd to get PATH (includes user PATH)
      const pathOutput = execSync('cmd /c echo %PATH%', {
        encoding: 'utf8',
        timeout: 2000,
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      return pathOutput.trim();
    } else {
      // Unix-like: use shell to get PATH from user's actual shell environment
      // Try to detect the user's default shell first
      const userShell = process.env.SHELL || '/bin/zsh';
      const shells = [userShell, '/bin/zsh', '/bin/bash', '/bin/sh'];

      for (const shell of shells) {
        if (fs.existsSync(shell)) {
          try {
            // For zsh, we need to load both login and interactive configs
            // zsh -l loads .zprofile/.zlogin, but .zshrc has interactive configs
            // Try interactive mode first (loads .zshrc), then login mode
            const shellName = path.basename(shell);
            let pathOutput;
            
            if (shellName === 'zsh') {
              // For zsh, try interactive mode to get .zshrc PATH additions
              try {
                pathOutput = execSync(`${shell} -i -c 'echo $PATH'`, {
                  encoding: 'utf8',
                  timeout: 2000,
                  stdio: ['ignore', 'pipe', 'ignore'],
                  maxBuffer: 1024 * 1024,
                  env: {
                    ...Object.fromEntries(
                      Object.entries(process.env).filter(([key]) => key !== 'PATH')
                    ),
                  },
                });
              } catch (_e) {
                // Fallback to login shell
                pathOutput = execSync(`${shell} -l -c 'echo $PATH'`, {
                  encoding: 'utf8',
                  timeout: 2000,
                  stdio: ['ignore', 'pipe', 'ignore'],
                  maxBuffer: 1024 * 1024,
                  env: {
                    ...Object.fromEntries(
                      Object.entries(process.env).filter(([key]) => key !== 'PATH')
                    ),
                  },
                });
              }
            } else {
              // For bash/sh, use login shell
              pathOutput = execSync(`${shell} -l -c 'echo $PATH'`, {
                encoding: 'utf8',
                timeout: 2000,
                stdio: ['ignore', 'pipe', 'ignore'],
                maxBuffer: 1024 * 1024,
                env: {
                  ...Object.fromEntries(
                    Object.entries(process.env).filter(([key]) => key !== 'PATH')
                  ),
                },
              });
            }
            
            const systemPath = pathOutput.trim();
            if (systemPath) {
              console.log(`[Server Manager] Got PATH from ${shell} (${shellName})`);
              return systemPath;
            }
          } catch (_e) {
            // Try next shell
            continue;
          }
        }
      }

      // Fallback: try to read from common shell config files
      // For zsh, check .zshrc first (interactive), then .zprofile (login)
      const os = require('os');
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
            // For zsh interactive configs, use -i flag
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
              // Only use if we got a meaningful PATH
              console.log(`[Server Manager] Got PATH from ${file}`);
              return systemPath;
            }
          } catch (_e) {
            // Try next config file
            continue;
          }
        }
      }
    }
  } catch (error) {
    console.warn('[Server Manager] Could not get system PATH:', error.message);
  }
  return null;
}

/**
 * Enhance PATH environment variable to include system paths and user paths
 * This is especially important in Electron where PATH might not include system executables
 */
export function enhancePath(originalPath) {
  const os = require('os');
  const homeDir = os.homedir();
  const pathSeparator = process.platform === 'win32' ? ';' : ':';

  // Try to get the actual system PATH from the host (includes user's custom PATH)
  const systemPath = getSystemPath();
  if (systemPath) {
    console.log('[Server Manager] Using system PATH from host machine');
    // Combine system PATH with original PATH, prioritizing system PATH
    // Also add user-specific paths that might not be in system PATH
    const userPaths = [
      // Common user-specific binary locations
      path.join(homeDir, '.local', 'bin'),
      path.join(homeDir, '.npm-global', 'bin'),
      path.join(homeDir, '.cargo', 'bin'),
      path.join(homeDir, 'bin'),
      // Node version managers
      path.join(homeDir, '.nvm', 'current', 'bin'),
      // Try to find actual nvm node version (check common versions)
      ...(function () {
        try {
          const nvmVersionsPath = path.join(homeDir, '.nvm', 'versions', 'node');
          if (fs.existsSync(nvmVersionsPath)) {
            return fs
              .readdirSync(nvmVersionsPath, { withFileTypes: true })
              .filter((dirent) => dirent.isDirectory())
              .map((dirent) =>
                path.join(nvmVersionsPath, dirent.name, 'bin')
              );
          }
        } catch (_e) {
          // Ignore errors reading nvm directory
        }
        return [];
      })(),
      path.join(homeDir, '.fnm', 'node-versions', 'v20.0.0', 'install', 'bin'), // fnm
      // Python version managers
      path.join(homeDir, '.pyenv', 'shims'),
      path.join(homeDir, '.pyenv', 'bin'),
      // Go version managers
      path.join(homeDir, '.gvm', 'bin'),
      path.join(homeDir, '.gvm', 'gos', 'current', 'bin'),
      // Rust/Cargo
      path.join(homeDir, '.cargo', 'bin'),
      // Go
      path.join(homeDir, 'go', 'bin'),
      path.join(homeDir, '.go', 'bin'),
      // iTerm utilities
      '/Applications/iTerm.app/Contents/Resources/utilities',
      // Windows user paths
      ...(process.platform === 'win32'
        ? [
            path.join(homeDir, 'AppData', 'Local', 'Programs'),
            path.join(homeDir, 'AppData', 'Roaming', 'npm'),
            path.join(homeDir, 'AppData', 'Local', 'Microsoft', 'WindowsApps'),
          ]
        : []),
    ].filter((p) => {
      // Filter out paths that don't exist, but allow dynamic version paths
      if (p.includes('v20.0.0') || p.includes('current')) {
        // For version manager paths, check if parent directory exists
        return fs.existsSync(path.dirname(p));
      }
      return fs.existsSync(p);
    });

    // Combine: system PATH (from shell) + user-specific paths + original PATH
    return [
      systemPath,
      ...userPaths,
      originalPath || '',
    ]
      .filter((p) => p)
      .join(pathSeparator);
  }

  // Fallback: add common system and user locations
  console.log('[Server Manager] Could not get system PATH, adding common locations');
  const pathsToAdd = [
    // System binary locations
    '/usr/local/bin',
    '/usr/bin',
    '/opt/homebrew/bin',
    '/usr/local/opt/node/bin',
    '/opt/local/bin',
    '/sbin',
    '/usr/sbin',
    // macOS specific
    ...(process.platform === 'darwin'
      ? [
          '/opt/homebrew/opt/python/bin',
          '/usr/local/opt/python/bin',
          '/Applications/Docker.app/Contents/Resources/bin',
        ]
      : []),
    // Linux specific
    ...(process.platform === 'linux'
      ? ['/snap/bin', path.join(homeDir, '.local', 'bin')]
      : []),
    // Windows specific
    ...(process.platform === 'win32'
      ? [
          path.join(process.env.ProgramFiles || '', 'nodejs'),
          path.join(process.env['ProgramFiles(x86)'] || '', 'nodejs'),
          path.join(homeDir, 'AppData', 'Roaming', 'npm'),
          path.join(
            process.env.ProgramFiles || '',
            'Docker',
            'Docker',
            'resources',
            'bin'
          ),
        ]
      : []),
    // User-specific paths (prioritize these)
    path.join(homeDir, '.local', 'bin'),
    path.join(homeDir, '.npm-global', 'bin'),
    path.join(homeDir, '.cargo', 'bin'),
    path.join(homeDir, 'bin'),
    path.join(homeDir, '.nvm', 'current', 'bin'),
    // Try to find actual nvm node version (check common versions)
    ...(function () {
      try {
        const nvmVersionsPath = path.join(homeDir, '.nvm', 'versions', 'node');
        if (fs.existsSync(nvmVersionsPath)) {
          return fs
            .readdirSync(nvmVersionsPath, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => path.join(nvmVersionsPath, dirent.name, 'bin'));
        }
      } catch (_e) {
        // Ignore errors reading nvm directory
      }
      return [];
    })(),
    path.join(homeDir, '.pyenv', 'shims'),
    path.join(homeDir, '.pyenv', 'bin'),
    path.join(homeDir, '.gvm', 'bin'),
    path.join(homeDir, '.gvm', 'gos', 'current', 'bin'),
    path.join(homeDir, 'go', 'bin'),
    path.join(homeDir, '.go', 'bin'),
    // iTerm utilities
    '/Applications/iTerm.app/Contents/Resources/utilities',
    // Windows user paths
    ...(process.platform === 'win32'
      ? [
          path.join(homeDir, 'AppData', 'Local', 'Programs'),
          path.join(homeDir, 'AppData', 'Local', 'Microsoft', 'WindowsApps'),
        ]
      : []),
  ].filter((p) => p && fs.existsSync(p));

  return [...pathsToAdd, originalPath || ''].filter((p) => p).join(pathSeparator);
}