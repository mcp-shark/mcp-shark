#!/usr/bin/env node

/**
 * MCP Shark CLI Entry Point
 * Default command: scan (the 10K-star command)
 */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import open from 'open';
import { executeDoctor } from '#core/cli/DoctorCommand.js';
import { executeList } from '#core/cli/ListCommand.js';
import { executeDiff, executeLock, executeLockVerify } from '#core/cli/LockCommand.js';
import { executeScan } from '#core/cli/ScanCommand.js';
import { executeUpdateRules } from '#core/cli/UpdateCommand.js';
import { executeWatch } from '#core/cli/WatchCommand.js';
import { displayServeBanner } from '#core/cli/output/Banner.js';
import { bootstrapLogger as logger } from '#core/libraries/index.js';
import { launchTui } from '#core/tui/render.js';

const SERVER_URL = 'http://localhost:9853';
const BROWSER_OPEN_DELAY = 1000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

function getVersion() {
  try {
    const pkgPath = join(rootDir, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    return pkg.version;
  } catch (_err) {
    return '0.0.0';
  }
}

const uiDir = join(rootDir, 'ui');
const distDir = join(uiDir, 'dist');

function validateUIBuilt() {
  if (!existsSync(distDir)) {
    logger.error(
      'Error: UI build not found. The package should include pre-built UI files.\n' +
        'If you are developing, run: npm run build:ui'
    );
    process.exit(1);
  }
}

async function openBrowser() {
  await new Promise((r) => setTimeout(r, BROWSER_OPEN_DELAY));
  open(SERVER_URL);
}

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

  const shutdown = async (signal) => {
    if (shutdownState.isShuttingDown) {
      return;
    }
    shutdownState.isShuttingDown = true;
    logger.info('Shutting down...');
    serverProcess.kill(signal);

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

function validateDirectories() {
  if (!existsSync(uiDir)) {
    logger.error('Error: UI directory not found.');
    process.exit(1);
  }
}

async function main() {
  const version = getVersion();

  const program = new Command();
  program.name('mcp-shark').description('Security scanner for AI agent tools').version(version);

  program
    .command('scan', { isDefault: true })
    .description('Scan MCP configurations for security issues (default)')
    .option('--fix', 'Auto-fix fixable issues')
    .option('--undo', 'Undo previous --fix changes (use with --fix)')
    .option('--yes', 'Skip confirmation prompt for --fix')
    .option('--walkthrough', 'Show full attack chain narratives')
    .option('--ci', 'CI mode: exit code 1 on critical/high findings')
    .option('--format <format>', 'Output format: terminal, json, sarif, html', 'terminal')
    .option('--output <path>', 'Write report to file (for html format)')
    .option('--strict', 'Count advisory findings in score')
    .option('--ide <name>', 'Scan specific IDE only')
    .option('--rules <path>', 'Load custom YAML rules from directory')
    .action(async (options) => {
      const exitCode = await executeScan(options);
      if (exitCode !== 0) {
        process.exit(exitCode);
      }
    });

  program
    .command('lock')
    .description('Create or update .mcp-shark.lock (pin tool definitions)')
    .option('--verify', 'Verify current state matches lockfile')
    .action((options) => {
      const exitCode = options.verify ? executeLockVerify() : executeLock(options);
      if (exitCode !== 0) {
        process.exit(exitCode);
      }
    });

  program
    .command('diff')
    .description('Show tool definition changes since last lock')
    .action(() => {
      const exitCode = executeDiff();
      if (exitCode !== 0) {
        process.exit(exitCode);
      }
    });

  program
    .command('doctor')
    .description('Run environment health checks')
    .action(() => {
      const exitCode = executeDoctor();
      if (exitCode !== 0) {
        process.exit(exitCode);
      }
    });

  program
    .command('tui')
    .description('Launch interactive terminal UI (lazygit-style)')
    .action(async () => {
      await launchTui();
    });

  program
    .command('watch')
    .description('Watch config files and re-scan on changes')
    .action(() => {
      const exitCode = executeWatch();
      if (exitCode !== 0) {
        process.exit(exitCode);
      }
    });

  program
    .command('list')
    .description('Show inventory of all detected MCP servers')
    .option('--format <format>', 'Output format: terminal, json', 'terminal')
    .action((options) => {
      const exitCode = executeList(options);
      if (exitCode !== 0) {
        process.exit(exitCode);
      }
    });

  program
    .command('update-rules')
    .description('Download latest rule packs from remote registry')
    .option('--source <url>', 'Custom manifest URL (enterprise registries)')
    .action(async (options) => {
      await executeUpdateRules(options);
    });

  program
    .command('serve')
    .description('Start the web UI on localhost:9853')
    .option('-o, --open', 'Open the browser', false)
    .action(async (options) => {
      displayServeBanner();
      validateDirectories();
      validateUIBuilt();
      await startServer(options.open);
    });

  await program.parseAsync(process.argv);
}

main().catch((error) => {
  logger.error({ error: error.message }, 'Unexpected error');
  process.exit(1);
});
