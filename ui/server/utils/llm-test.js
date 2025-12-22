import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

function getTestScriptPath() {
  return fileURLToPath(new URL('../../../lib/llm/test-load-child.js', import.meta.url));
}

export function testLoadModelInSubprocess(payload, { timeoutMs = 120_000 } = {}) {
  return new Promise((resolve, reject) => {
    const scriptPath = getTestScriptPath();
    const child = spawn(process.execPath, [scriptPath, JSON.stringify(payload || {})], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const stdoutChunks = [];
    const stderrChunks = [];

    child.stdout.on('data', (chunk) => {
      stdoutChunks.push(chunk);
    });

    child.stderr.on('data', (chunk) => {
      stderrChunks.push(chunk);
    });

    const timeout = setTimeout(() => {
      child.kill('SIGKILL');
      const stderr = Buffer.concat(stderrChunks).toString('utf8');
      reject(new Error(`LLM test timed out after ${timeoutMs}ms${stderr ? `: ${stderr}` : ''}`));
    }, timeoutMs);

    child.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    child.on('close', (code) => {
      clearTimeout(timeout);
      const stdout = Buffer.concat(stdoutChunks).toString('utf8').trim();
      const stderr = Buffer.concat(stderrChunks).toString('utf8').trim();

      try {
        const parsed = stdout ? JSON.parse(stdout) : null;
        if (code === 0 && parsed && parsed.ok) {
          resolve(parsed);
          return;
        }
        const errorMessage =
          parsed?.error ||
          (stderr ? stderr : stdout ? stdout : `LLM test exited with code ${code ?? 'unknown'}`);
        reject(new Error(errorMessage));
      } catch (_error) {
        reject(
          new Error(
            stderr ? stderr : stdout ? stdout : `LLM test exited with code ${code ?? 'unknown'}`
          )
        );
      }
    });
  });
}
