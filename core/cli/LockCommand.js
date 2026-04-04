/**
 * Lock / Diff Commands
 * Creates and verifies .mcp-shark.lock — SHA-256 hashes of tool definitions
 * Detects rug pull attacks (Catalog §1.5)
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import figures from 'figures';
import kleur from 'kleur';
import { getAllServers, scanIdeConfigs } from './ConfigScanner.js';

const LOCKFILE_NAME = '.mcp-shark.lock';

/**
 * Execute the lock command — create or update lockfile
 */
export function executeLock(options = {}) {
  const ideResults = scanIdeConfigs();
  const servers = getAllServers(ideResults);

  if (servers.length === 0) {
    console.log(`  ${kleur.yellow(figures.warning)} No MCP servers found to lock`);
    return 1;
  }

  const lockData = buildLockData(servers);
  const lockfilePath = join(process.cwd(), LOCKFILE_NAME);
  const content = JSON.stringify(lockData, null, 2);

  writeFileSync(lockfilePath, content, 'utf-8');
  console.log('');
  console.log(`  ${kleur.green(figures.tick)} Lockfile created: ${LOCKFILE_NAME}`);
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
    console.log(`  ${kleur.red(figures.cross)} No ${LOCKFILE_NAME} found`);
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
    console.log(`  ${kleur.yellow(figures.warning)} No ${LOCKFILE_NAME} found`);
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

    serverEntries[server.name] = {
      source: server.ide,
      config_path: server.configPath,
      tools: toolHashes,
      tool_count: tools.length,
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
 * Hash a tool definition using SHA-256
 */
function hashToolDefinition(tool) {
  const canonical = JSON.stringify({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema || tool.parameters,
  });
  return createHash('sha256').update(canonical).digest('hex');
}

/**
 * Count parameters in a tool definition
 */
function countParameters(tool) {
  const schema = tool.inputSchema || tool.parameters || {};
  const properties = schema.properties || {};
  return Object.keys(properties).length;
}

/**
 * Verify current state matches lockfile
 */
function verifyLockfile(lockData) {
  const ideResults = scanIdeConfigs();
  const currentServers = getAllServers(ideResults);
  const changes = computeDiff(lockData, currentServers);

  if (changes.length === 0) {
    console.log(`  ${kleur.green(figures.tick)} All definitions match lockfile`);
    return 0;
  }

  console.log(`  ${kleur.red(figures.cross)} ${changes.length} changes detected`);
  renderDiff(changes);
  return 1;
}

/**
 * Compute diff between lockfile and current state
 */
function computeDiff(lockData, currentServers) {
  const changes = [];

  for (const server of currentServers) {
    const locked = lockData.servers[server.name];
    if (!locked) {
      changes.push({ type: 'added_server', server: server.name, ide: server.ide });
      continue;
    }

    const tools = Array.isArray(server.tools) ? server.tools : [];
    for (const tool of tools) {
      const toolObj = typeof tool === 'string' ? { name: tool } : tool;
      const toolName = toolObj.name || 'unknown';
      const lockedTool = locked.tools[toolName];

      if (!lockedTool) {
        changes.push({ type: 'added_tool', server: server.name, tool: toolName });
        continue;
      }

      const currentHash = `sha256:${hashToolDefinition(toolObj)}`;
      if (currentHash !== lockedTool.hash) {
        changes.push({ type: 'changed_tool', server: server.name, tool: toolName });
      }
    }

    for (const lockedToolName of Object.keys(locked.tools)) {
      const stillExists = tools.some((t) => {
        const name = typeof t === 'string' ? t : t.name;
        return name === lockedToolName;
      });
      if (!stillExists) {
        changes.push({ type: 'removed_tool', server: server.name, tool: lockedToolName });
      }
    }
  }

  for (const lockedServerName of Object.keys(lockData.servers)) {
    const stillExists = currentServers.some((s) => s.name === lockedServerName);
    if (!stillExists) {
      changes.push({ type: 'removed_server', server: lockedServerName });
    }
  }

  return changes;
}

/**
 * Render diff changes to terminal
 */
function renderDiff(changes) {
  if (changes.length === 0) {
    console.log(`  ${kleur.green(figures.tick)} No changes detected`);
    return;
  }

  console.log('');
  for (const change of changes) {
    if (change.type === 'added_server') {
      console.log(
        `  ${kleur.green('+')} Server added: ${kleur.bold(change.server)} (${change.ide})`
      );
    }
    if (change.type === 'removed_server') {
      console.log(`  ${kleur.red('-')} Server removed: ${kleur.bold(change.server)}`);
    }
    if (change.type === 'added_tool') {
      console.log(`  ${kleur.green('+')} Tool added: ${change.server}/${kleur.bold(change.tool)}`);
    }
    if (change.type === 'removed_tool') {
      console.log(`  ${kleur.red('-')} Tool removed: ${change.server}/${kleur.bold(change.tool)}`);
    }
    if (change.type === 'changed_tool') {
      console.log(
        `  ${kleur.yellow('~')} Tool changed: ${change.server}/${kleur.bold(change.tool)} ${kleur.yellow(figures.warning)}`
      );
    }
  }
  console.log('');
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
