#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import open from 'open';

const SERVER_URL = 'http://localhost:9853';
const BROWSER_OPEN_DELAY = 1000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

/**
 * Display welcome banner
 */
function displayWelcomeBanner() {
  const pkgPath = join(rootDir, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  const version = pkg.version;

  const banner = `
   ███╗   ███╗ ██████╗ ██████╗      ███████╗██╗  ██╗ █████╗ ██████╗ ██╗  ██╗
   ████╗ ████║██╔════╝██╔══██╗     ██╔════╝██║  ██║██╔══██╗██╔══██╗██║ ██╔╝
   ██╔████╔██║██║     ██████╔╝     ███████╗███████║███████║██████╔╝█████╔╝ 
   ██║╚██╔╝██║██║     ██╔═══╝      ╚════██║██╔══██║██╔══██║██╔══██╗██╔═██╗ 
   ██║ ╚═╝ ██║╚██████╗██║          ███████║██║  ██║██║  ██║██║  ██║██║  ██╗
   ╚═╝     ╚═╝ ╚═════╝╚═╝          ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝
   
   Aggregate multiple MCP servers into a unified interface
   Version: ${version} | Homepage: https://mcpshark.sh
`;

  console.log(banner);
}

const uiDir = join(rootDir, 'ui');
const distDir = join(uiDir, 'dist');
const rootNodeModules = join(rootDir, 'node_modules');

/**
 * Run a command and return a promise that resolves when it completes
 */
function runCommand(command, args, options) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      ...options,
      stdio: 'inherit',
      shell: true,
    });

    process.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with exit code ${code}`));
      } else {
        resolve();
      }
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Install dependencies in the root directory
 */
async function installDependencies() {
  console.log('Installing dependencies...');
  try {
    await runCommand('npm', ['install'], { cwd: rootDir });
    console.log('Dependencies installed successfully!\n');
  } catch (error) {
    console.error('Failed to install dependencies:', error.message);
    process.exit(1);
  }
}

/**
 * Build the UI for production
 */
async function buildUI() {
  console.log('Building UI for production...');
  try {
    await runCommand('vite', ['build'], { cwd: uiDir });
  } catch (error) {
    console.error('Failed to build UI:', error.message);
    process.exit(1);
  }
}

/**
 * Open the browser after a short delay
 */
async function openBrowser() {
  await new Promise((resolve) => setTimeout(resolve, BROWSER_OPEN_DELAY));
  open(SERVER_URL);
}

/**
 * Start the UI server
 */
async function startServer(shouldOpenBrowser = false) {
  console.log('Starting MCP Shark UI server...');
  console.log(`Open ${SERVER_URL} in your browser`);
  console.log('Press Ctrl+C to stop\n');

  const serverProcess = spawn('node', ['server.js'], {
    cwd: uiDir,
    stdio: 'inherit',
    shell: true,
  });

  if (shouldOpenBrowser) {
    await openBrowser();
  }

  let isShuttingDown = false;

  serverProcess.on('close', (code) => {
    if (!isShuttingDown) {
      if (code !== 0 && code !== null) {
        console.error(`Server exited with code ${code}`);
        process.exit(code);
      }
    } else {
      process.exit(0);
    }
  });

  // Handle process termination
  const shutdown = async (signal) => {
    if (isShuttingDown) {
      return;
    }
    isShuttingDown = true;

    console.log('Shutting down...');

    // Send signal to child process
    serverProcess.kill(signal);

    // Wait for child process to exit, with timeout
    const timeout = setTimeout(() => {
      console.log('Forcefully terminating server process...');
      serverProcess.kill('SIGKILL');
      process.exit(1);
    }, 5000);

    serverProcess.once('close', () => {
      clearTimeout(timeout);
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

/**
 * Validate that required directories exist
 */
function validateDirectories() {
  if (!existsSync(uiDir)) {
    console.error('Error: UI directory not found. Please ensure you are in the correct directory.');
    process.exit(1);
  }
}

/**
 * Ensure dependencies are installed
 */
async function ensureDependencies() {
  if (!existsSync(rootNodeModules)) {
    await installDependencies();
  }
}

/**
 * Ensure UI is built
 */
async function ensureUIBuilt() {
  if (!existsSync(distDir)) {
    await buildUI();
  }
}

/**
 * Main execution function
 */
async function main() {
  // Display welcome banner
  displayWelcomeBanner();

  // Parse command line options
  const program = new Command();
  program.option('-o, --open', 'Open the browser', false).parse(process.argv);

  const options = program.opts();

  // Validate environment
  validateDirectories();

  // Ensure dependencies are installed
  await ensureDependencies();

  // Ensure UI is built
  await ensureUIBuilt();

  // Start the server
  await startServer(options.open);
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
