/**
 * Generate an asciicast v2 file from actual mcp-shark command output.
 * Then convert to GIF with: agg docs/assets/demo.cast docs/assets/demo.gif
 */
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COLS = 100;
const ROWS = 40;

function runCmd(cmd) {
  try {
    return execSync(cmd, {
      encoding: 'utf-8',
      cwd: join(__dirname, '..', '..'),
      env: { ...process.env, FORCE_COLOR: '1', NO_COLOR: '', TERM: 'xterm-256color' },
    });
  } catch (e) {
    return e.stdout || '';
  }
}

function buildCast(commands) {
  const events = [];
  let t = 0;

  const header = JSON.stringify({
    version: 2,
    width: COLS,
    height: ROWS,
    timestamp: Math.floor(Date.now() / 1000),
    env: { SHELL: '/bin/bash', TERM: 'xterm-256color' },
    theme: {
      fg: '#cdd6f4',
      bg: '#1e1e2e',
      palette:
        '#45475a:#f38ba8:#a6e3a1:#f9e2af:#89b4fa:#f5c2e7:#89dceb:#bac2de:#585b70:#f38ba8:#a6e3a1:#f9e2af:#89b4fa:#f5c2e7:#89dceb:#a6adc8',
    },
  });

  const emit = (text) => {
    events.push(JSON.stringify([t, 'o', text]));
  };

  const typeCmd = (text) => {
    emit('\x1b[1;32m$\x1b[0m ');
    t += 0.3;
    for (const ch of text) {
      emit(ch);
      t += 0.035 + Math.random() * 0.025;
    }
    t += 0.2;
    emit('\r\n');
    t += 0.1;
  };

  const showOutput = (output) => {
    const lines = output.split('\n');
    for (const line of lines) {
      emit(`${line}\r\n`);
      t += 0.02;
    }
  };

  t += 0.5;

  for (let i = 0; i < commands.length; i++) {
    const { display, cmd } = commands[i];
    typeCmd(display);
    const output = runCmd(cmd);
    showOutput(output);
    t += 1.5;
  }

  t += 1.0;

  return `${header}\n${events.join('\n')}\n`;
}

const commands = [
  { display: 'npx mcp-shark', cmd: 'node bin/mcp-shark.js scan' },
  { display: 'npx mcp-shark list', cmd: 'node bin/mcp-shark.js list' },
  { display: 'npx mcp-shark doctor', cmd: 'node bin/mcp-shark.js doctor' },
  { display: 'npx mcp-shark --help', cmd: 'node bin/mcp-shark.js --help' },
];

const castContent = buildCast(commands);
const castPath = join(__dirname, 'demo.cast');
writeFileSync(castPath, castContent, 'utf-8');
console.log(`Written ${castPath} (${(castContent.length / 1024).toFixed(1)}KB)`);
