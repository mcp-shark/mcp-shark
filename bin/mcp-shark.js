#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { existsSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const uiDir = join(rootDir, 'ui');

// Check if UI directory exists
if (!existsSync(uiDir)) {
  console.error('Error: UI directory not found. Please ensure you are in the correct directory.');
  process.exit(1);
}

// Check if node_modules exists in root directory
const rootNodeModules = join(rootDir, 'node_modules');
if (!existsSync(rootNodeModules)) {
  console.log('Installing dependencies...');
  const installProcess = spawn('npm', ['install'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true,
  });

  installProcess.on('close', (code) => {
    if (code !== 0) {
      console.error('Failed to install dependencies');
      process.exit(1);
    }
    console.log('Dependencies installed successfully!\n');
    startUIServer();
  });
} else {
  startUIServer();
}

function startUIServer() {
  // Check if dist directory exists (production build)
  const distDir = join(uiDir, 'dist');
  if (!existsSync(distDir)) {
    console.log('Building UI for production...');
    const buildProcess = spawn('npm', ['run', 'build'], {
      cwd: uiDir,
      stdio: 'inherit',
      shell: true,
    });

    buildProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Failed to build UI');
        process.exit(1);
      }
      runServer();
    });
  } else {
    runServer();
  }
}

function runServer() {
  console.log('Starting MCP Shark UI server...');
  console.log('Open http://localhost:9853 in your browser');
  console.log('Press Ctrl+C to stop\n');

  const serverProcess = spawn('node', ['server.js'], {
    cwd: uiDir,
    stdio: 'inherit',
    shell: true,
  });

  serverProcess.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`Server exited with code ${code}`);
      process.exit(code);
    }
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\nShutting down...');
    serverProcess.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    serverProcess.kill('SIGTERM');
    process.exit(0);
  });
}
