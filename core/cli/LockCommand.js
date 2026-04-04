/**
 * Lock / Diff Commands
 * Creates and verifies .mcp-shark.lock — SHA-256 hashes of tool definitions
 * Detects rug pull attacks (Catalog §1.5)
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import kleur from 'kleur';
import { getAllServers, scanIdeConfigs } from './ConfigScanner.js';
import { computeDiff, countParameters, hashToolDefinition, renderDiff } from './LockDiffEngine.js';
import { S } from './symbols.js';

const LOCKFILE_NAME = '.mcp-shark.lock';

/**
 * Execute the lock command — create or update lockfile
 */
export function executeLock(options = {}) {
  const ideResults = scanIdeConfigs();
  const servers = getAllServers(ideResults);

  if (servers.length === 0) {
    console.log(`  ${kleur.yellow(S.warn)} No MCP servers found to lock`);
    return 1;
  }

  const lockData = buildLockData(servers);
  const lockfilePath = join(process.cwd(), LOCKFILE_NAME);
  const content = JSON.stringify(lockData, null, 2);

  writeFileSync(lockfilePath, content, 'utf-8');
  console.log('');
  console.log(`  ${kleur.green(S.pass)} Lockfile created: ${LOCKFILE_NAME}`);
  console.log(`  ${kleur.dim(`${Object.keys(lockData.servers).length} servers locked`)}`);

  if (options.verify) {
    return verifyLockfile(lockData);
  }

  console.log('');
  console.log(kleur.dim('  Commit this file to detect future tool definition changes.'));
  console.log(kleur.dim('  Verify: npx mcp-shark lock --verify'));
  console.log('');

  return 0;
}

/**
 * Execute lock --verify — compare current state against lockfile
 */
export function executeLockVerify() {
  const lockfilePath = join(process.cwd(), LOCKFILE_NAME);

  if (!existsSync(lockfilePath)) {
    console.log(`  ${kleur.red(S.fail)} No ${LOCKFILE_NAME} found`);
    console.log(kleur.dim('  Run: npx mcp-shark lock'));
    return 1;
  }

  const lockData = JSON.parse(readFileSync(lockfilePath, 'utf-8'));
  return verifyLockfile(lockData);
}

/**
 * Execute the diff command — show changes since last lock
 */
export function executeDiff() {
  const lockfilePath = join(process.cwd(), LOCKFILE_NAME);

  if (!existsSync(lockfilePath)) {
    console.log(`  ${kleur.yellow(S.warn)} No ${LOCKFILE_NAME} found`);
    console.log(kleur.dim('  Run: npx mcp-shark lock'));
    return 1;
  }

  const lockData = JSON.parse(readFileSync(lockfilePath, 'utf-8'));
  const ideResults = scanIdeConfigs();
  const currentServers = getAllServers(ideResults);

  const changes = computeDiff(lockData, currentServers);
  renderDiff(changes);

  return changes.length > 0 ? 1 : 0;
}

/**
 * Build lockfile data structure
 */
function buildLockData(servers) {
  const now = new Date().toISOString();
  const serverEntries = {};

  for (const server of servers) {
    const toolHashes = buildToolHashes(server, now);

    serverEntries[server.name] = {
      source: server.ide,
      config_path: server.configPath,
      tools: toolHashes,
      tool_count: (Array.isArray(server.tools) ? server.tools : []).length,
      locked_at: now,
    };
  }

  return {
    version: 1,
    created: now,
    updated: now,
    shark_version: getSharkVersion(),
    servers: serverEntries,
  };
}

/**
 * Build tool hash entries for a server
 */
function buildToolHashes(server, now) {
  const toolHashes = {};
  const tools = Array.isArray(server.tools) ? server.tools : [];

  for (const tool of tools) {
    const toolObj = typeof tool === 'string' ? { name: tool } : tool;
    const hash = hashToolDefinition(toolObj);
    toolHashes[toolObj.name || 'unknown'] = {
      hash: `sha256:${hash}`,
      description_length: (toolObj.description || '').length,
      parameter_count: countParameters(toolObj),
      pinned_at: now,
    };
  }

  return toolHashes;
}

/**
 * Verify current state matches lockfile
 */
function verifyLockfile(lockData) {
  const ideResults = scanIdeConfigs();
  const currentServers = getAllServers(ideResults);
  const changes = computeDiff(lockData, currentServers);

  if (changes.length === 0) {
    console.log(`  ${kleur.green(S.pass)} All definitions match lockfile`);
    return 0;
  }

  console.log(`  ${kleur.red(S.fail)} ${changes.length} changes detected`);
  renderDiff(changes);
  return 1;
}

/**
 * Get shark version from package.json
 */
function getSharkVersion() {
  try {
    const pkgPath = join(import.meta.dirname, '..', '..', 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    return pkg.version;
  } catch (_err) {
    return '1.0.0';
  }
}
