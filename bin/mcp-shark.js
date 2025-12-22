#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import open from 'open';
import { bootstrapLogger as logger } from '#core/libraries';

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

  logger.log(banner);
}

const uiDir = join(rootDir, 'ui');
const distDir = join(uiDir, 'dist');

/**
 * Validate that UI dist directory exists
 */
function validateUIBuilt() {
  if (!existsSync(distDir)) {
    logger.error(
      'Error: UI build not found. The package should include pre-built UI files.\n' +
        'If you are developing, run: npm run build:ui'
    );
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
  logger.info('Starting MCP Shark UI server...');
  logger.info(`Open ${SERVER_URL} in your browser`);
  logger.info('Press Ctrl+C to stop\n');

  const serverProcess = spawn('node', ['server.js'], {
    cwd: uiDir,
    stdio: 'inherit',
    shell: true,
  });

  if (shouldOpenBrowser) {
    await openBrowser();
  }

  const shutdownState = { isShuttingDown: false };

  serverProcess.on('close', (code) => {
    if (!shutdownState.isShuttingDown) {
      if (code !== 0 && code !== null) {
        logger.error({ code }, 'Server exited with code');
        process.exit(code);
      }
    } else {
      process.exit(0);
    }
  });

  // Handle process termination
  const shutdown = async (signal) => {
    if (shutdownState.isShuttingDown) {
      return;
    }
    shutdownState.isShuttingDown = true;

    logger.info('Shutting down...');

    // Send signal to child process
    serverProcess.kill(signal);

    // Wait for child process to exit, with timeout
    const timeout = setTimeout(() => {
      logger.info('Forcefully terminating server process...');
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
    logger.error('Error: UI directory not found. Please ensure you are in the correct directory.');
    process.exit(1);
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

  // Validate UI is built (pre-built files should be included in package)
  validateUIBuilt();

  // Start the server
  await startServer(options.open);
}

main().catch((error) => {
  logger.error({ error: error.message }, 'Unexpected error');
  process.exit(1);
});
