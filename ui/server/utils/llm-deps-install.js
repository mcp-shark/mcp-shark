import { spawn } from 'node:child_process';
import { isNodeLlamaCppInstalled } from './llm-runtime.js';
import { getRepoRootDirectory } from './repo-root.js';

const installState = {
  current: null,
};

function getNpmCommand() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

export function getDepsInstallStatus() {
  if (!installState.current) {
    return { running: false, installed: isNodeLlamaCppInstalled() };
  }

  const current = installState.current;
  return {
    running: current.running,
    startedAt: current.startedAt,
    finishedAt: current.finishedAt,
    exitCode: current.exitCode,
    error: current.error,
    logTail: current.logTail,
    installed: isNodeLlamaCppInstalled(),
  };
}

export function cancelDepsInstall() {
  if (!installState.current || !installState.current.running) {
    return { cancelled: false };
  }
  installState.current.cancelled = true;
  installState.current.child.kill('SIGTERM');
  return { cancelled: true };
}

export function startDepsInstall() {
  if (isNodeLlamaCppInstalled()) {
    return getDepsInstallStatus();
  }

  if (installState.current?.running) {
    return getDepsInstallStatus();
  }

  const repoRoot = getRepoRootDirectory();
  const cmd = getNpmCommand();
  const args = ['install', '--no-audit', '--no-fund'];

  const child = spawn(cmd, args, { cwd: repoRoot, stdio: ['ignore', 'pipe', 'pipe'] });
  const state = {
    running: true,
    cancelled: false,
    startedAt: Date.now(),
    finishedAt: null,
    exitCode: null,
    error: null,
    logTail: [],
    child,
  };
  installState.current = state;

  const pushLog = (line) => {
    const trimmed = String(line || '').trimEnd();
    if (!trimmed) {
      return;
    }
    state.logTail.push(trimmed.slice(0, 2000));
    if (state.logTail.length > 200) {
      state.logTail.shift();
    }
  };

  child.stdout.on('data', (chunk) => {
    pushLog(chunk.toString('utf8'));
  });

  child.stderr.on('data', (chunk) => {
    pushLog(chunk.toString('utf8'));
  });

  child.on('error', (error) => {
    state.running = false;
    state.finishedAt = Date.now();
    state.exitCode = 1;
    state.error = error?.message || String(error);
  });

  child.on('close', (code) => {
    state.running = false;
    state.finishedAt = Date.now();
    state.exitCode = code ?? 0;
    if (state.cancelled) {
      state.error = 'Install cancelled';
    }
  });

  return getDepsInstallStatus();
}
