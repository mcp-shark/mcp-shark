import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { WebSocketClientTransport } from '@modelcontextprotocol/sdk/client/websocket.js';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as os from 'node:os';
import { execSync } from 'node:child_process';

import { CompositeError } from '../../../common/error.js';

export class TransportError extends CompositeError {
  constructor(message, error) {
    super('TransportError', message, error);
  }
}

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
            // Use -l (login shell) to load user's shell config files (.zshrc, .bashrc, etc.)
            // This ensures we get the user's custom PATH additions
            const pathOutput = execSync(`${shell} -l -c 'echo $PATH'`, {
              encoding: 'utf8',
              timeout: 3000,
              stdio: ['ignore', 'pipe', 'ignore'],
              // Don't pass PATH in env to avoid circular reference
              env: {
                ...Object.fromEntries(
                  Object.entries(process.env).filter(([key]) => key !== 'PATH')
                ),
              },
            });
            const systemPath = pathOutput.trim();
            if (systemPath) {
              console.log(`[Transport] Got PATH from ${shell}`);
              return systemPath;
            }
          } catch (_e) {
            // Try next shell
            continue;
          }
        }
      }

      // Fallback: try to read from common shell config files
      const homeDir = os.homedir();
      const configFiles = [
        { file: path.join(homeDir, '.zshrc'), shell: 'zsh' },
        { file: path.join(homeDir, '.bashrc'), shell: 'bash' },
        { file: path.join(homeDir, '.bash_profile'), shell: 'bash' },
        { file: path.join(homeDir, '.profile'), shell: 'sh' },
      ];

      for (const { file, shell: shellName } of configFiles) {
        if (fs.existsSync(file)) {
          try {
            // Source the config file and get PATH
            const pathOutput = execSync(
              `/bin/${shellName} -c 'source ${file} 2>/dev/null; echo $PATH'`,
              {
                encoding: 'utf8',
                timeout: 3000,
                stdio: ['ignore', 'pipe', 'ignore'],
                env: {
                  ...Object.fromEntries(
                    Object.entries(process.env).filter(
                      ([key]) => key !== 'PATH'
                    )
                  ),
                },
              }
            );
            const systemPath = pathOutput.trim();
            if (systemPath) {
              console.log(`[Transport] Got PATH from ${file}`);
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
    console.warn('[Transport] Could not get system PATH:', error.message);
  }
  return null;
}

/**
 * Find executable path using system 'which' (Unix) or 'where' (Windows) command
 * This accesses the host machine's actual PATH
 */
function findExecutableWithSystemCommand(command) {
  try {
    let execPath;
    if (process.platform === 'win32') {
      // Windows: use 'where' command
      execPath = execSync(`where ${command}`, {
        encoding: 'utf8',
        timeout: 2000,
        stdio: ['ignore', 'pipe', 'ignore'],
      })
        .trim()
        .split('\n')[0]; // Get first result
    } else {
      // Unix-like: use 'which' command
      execPath = execSync(`which ${command}`, {
        encoding: 'utf8',
        timeout: 2000,
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();
    }

    if (execPath && fs.existsSync(execPath)) {
      console.log(
        `[Transport] Found ${command} via system command: ${execPath}`
      );
      return execPath;
    }
  } catch (_error) {
    // Command not found or error - this is expected if executable doesn't exist
  }
  return null;
}

/**
 * Find executable path for common commands, especially for Electron environments where PATH might not include them
 * This handles npx, uv, docker, and other common executables
 * First tries to use system 'which'/'where' to access host machine's PATH
 */
function findExecutablePath(command) {
  // If we're in Electron, try to find the executable using system commands first
  if (process.env.ELECTRON_RUN_AS_NODE || process.resourcesPath) {
    try {
      // First, try to use system 'which'/'where' command to find the executable
      // This accesses the host machine's actual PATH
      const systemPath = findExecutableWithSystemCommand(command);
      if (systemPath) {
        return systemPath;
      }

      // Fallback: try to find in common locations relative to Electron
      const nodeExecPath = process.execPath;
      const nodeDir = path.dirname(nodeExecPath);

      // Common executable names to check (with platform-specific extensions)
      const extensions =
        process.platform === 'win32' ? ['', '.cmd', '.exe', '.bat'] : [''];

      // Try common locations for the executable
      const possiblePaths = [
        // Same directory as node/Electron
        ...extensions.map(ext => path.join(nodeDir, `${command}${ext}`)),
        // Unix-like bin directory
        ...extensions.map(ext =>
          path.join(nodeDir, '..', 'bin', `${command}${ext}`)
        ),
        // For npx specifically, also check npm's location
        ...(command === 'npx'
          ? [
              path.join(
                nodeDir,
                '..',
                'lib',
                'node_modules',
                'npm',
                'bin',
                'npx-cli.js'
              ),
            ]
          : []),
      ];

      for (const execPath of possiblePaths) {
        if (fs.existsSync(execPath)) {
          console.log(`[Transport] Found ${command} at: ${execPath}`);
          return execPath;
        }
      }

      // If executable not found, we'll enhance PATH instead
      // The enhanced PATH should help find it from system installations
      console.log(
        `[Transport] ${command} not found, will enhance PATH to search system locations`
      );
    } catch (error) {
      console.warn(`[Transport] Error finding ${command} path:`, error);
    }
  }

  console.log(`[Transport] [Final Fallback] ${command}`);
  return command; // Fallback to just the command name and hope it's in PATH (or enhanced PATH)
}

/**
 * Enhance PATH environment variable to include common tool binaries
 * This is especially important in Electron where PATH might not include:
 * - Node.js tools (node, npm, npx)
 * - Python tools (python, python3, uv)
 * - Docker
 * - Other common executables from Cursor/Windsurf MCP configs
 */
function enhancePath(originalPath) {
  // If we're in Electron, add common tool locations to PATH
  if (process.env.ELECTRON_RUN_AS_NODE || process.resourcesPath) {
    try {
      // First, try to get the actual system PATH from the host machine
      const systemPath = getSystemPath();
      if (systemPath) {
        console.log('[Transport] Using system PATH from host machine');
        // Combine system PATH with original PATH, prioritizing system PATH
        const pathSeparator = process.platform === 'win32' ? ';' : ':';
        return [systemPath, originalPath || '']
          .filter(p => p)
          .join(pathSeparator);
      }

      // Fallback: if we can't get system PATH, use hardcoded common locations
      console.log(
        '[Transport] Could not get system PATH, using common locations'
      );
      const nodeExecPath = process.execPath;
      const nodeDir = path.dirname(nodeExecPath);

      // Common paths to add - prioritize system installations
      // This includes Node.js, Python (for uv), Docker, and other common tools
      const homeDir = process.env.HOME || process.env.USERPROFILE || '';
      const pathsToAdd = [
        // System binary locations (checked first for all executables)
        '/usr/local/bin', // macOS/Linux common location
        '/usr/bin', // Linux system location
        '/opt/homebrew/bin', // macOS Homebrew on Apple Silicon
        '/usr/local/opt/node/bin', // macOS Homebrew Node.js
        '/opt/local/bin', // macOS MacPorts
        '/sbin', // System binaries
        '/usr/sbin', // System binaries
        // Windows common locations
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
              path.join(process.env.ProgramFiles || '', 'Docker'),
            ]
          : []),
        // macOS specific locations
        ...(process.platform === 'darwin'
          ? [
              '/opt/homebrew/opt/python/bin', // Homebrew Python
              '/usr/local/opt/python/bin', // Homebrew Python (Intel)
              '/Applications/Docker.app/Contents/Resources/bin', // Docker Desktop
            ]
          : []),
        // Linux specific locations
        ...(process.platform === 'linux'
          ? [
              '/snap/bin', // Snap packages
              path.join(homeDir, '.local', 'bin'), // User local binaries
            ]
          : []),
        // Electron and user-specific paths
        nodeDir, // Directory containing node executable (Electron)
        path.join(nodeDir, '..', 'bin'), // Unix-like bin directory relative to Electron
        path.join(homeDir, '.npm-global', 'bin'), // npm global bin
        path.join(homeDir, '.cargo', 'bin'), // Rust/Cargo binaries (for uv)
        path.join(homeDir, '.local', 'bin'), // User local binaries
      ].filter(p => p && fs.existsSync(p)); // Only include paths that exist

      const allPaths = [...pathsToAdd, originalPath || ''];
      const pathSeparator = process.platform === 'win32' ? ';' : ':';
      const enhancedPath = allPaths.join(pathSeparator);

      return enhancedPath;
    } catch (error) {
      console.warn('[Transport] Error enhancing PATH:', error);
    }
  }

  return originalPath || process.env.PATH || '';
}

export function makeTransport({
  type,
  url,
  headers: configHeaders = {},
  command,
  args = [],
  env: configEnv = {},
}) {
  // Start with enhanced PATH
  const enhancedPath = enhancePath(process.env.PATH);
  const env = {
    ...process.env,
    PATH: enhancedPath,
    ...configEnv,
  };

  // Try to find the full path for common executables (npx, uv, docker, etc.)
  // This helps in Electron where PATH might not include these
  let finalCommand = command;
  const commonCommands = [
    'npx',
    'uv',
    'docker',
    'node',
    'npm',
    'python',
    'python3',
  ];
  if (commonCommands.includes(command)) {
    const execPath = findExecutablePath(command);
    if (execPath !== command) {
      finalCommand = execPath;
      console.log(`[Transport] Using ${command} path: ${execPath}`);
    }
  }

  const requestInit = { headers: { ...configHeaders } };

  switch (type) {
    case 'stdio':
      return new StdioClientTransport({ command: finalCommand, args, env });
    case 'http':
    case 'sse':
    case 'streamable-http':
      return new StreamableHTTPClientTransport(new URL(url), {
        requestInit,
      });
    case 'ws':
    case 'websocket':
      return new WebSocketClientTransport(new URL(url));
    default:
      if (command) {
        // fallback: assume stdio if only command is provided
        return new StdioClientTransport({
          command: finalCommand,
          args,
          env,
        });
      }
      return new TransportError(
        'Unsupported server config',
        new Error(
          `Unsupported server config: ${JSON.stringify({ type, url, configHeaders, command, args })}`
        )
      );
  }
}
