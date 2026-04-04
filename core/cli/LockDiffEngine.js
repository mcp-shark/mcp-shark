/**
 * Lock Diff Engine
 * Computes and renders differences between lockfile and current MCP state.
 * Used by both `lock --verify` and `diff` commands.
 */
import { createHash } from 'node:crypto';
import kleur from 'kleur';
import { S } from './symbols.js';

/**
 * Hash a tool definition using SHA-256
 */
export function hashToolDefinition(tool) {
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
export function countParameters(tool) {
  const schema = tool.inputSchema || tool.parameters || {};
  const properties = schema.properties || {};
  return Object.keys(properties).length;
}

/**
 * Compute diff between lockfile and current state
 * @param {object} lockData - Parsed lockfile data
 * @param {Array} currentServers - Current servers from ConfigScanner
 * @returns {Array} List of change objects
 */
export function computeDiff(lockData, currentServers) {
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

    checkRemovedTools(locked, tools, server.name, changes);
  }

  checkRemovedServers(lockData, currentServers, changes);

  return changes;
}

/**
 * Check for tools that were in lockfile but removed from current state
 */
function checkRemovedTools(locked, tools, serverName, changes) {
  for (const lockedToolName of Object.keys(locked.tools)) {
    const stillExists = tools.some((t) => {
      const name = typeof t === 'string' ? t : t.name;
      return name === lockedToolName;
    });
    if (!stillExists) {
      changes.push({ type: 'removed_tool', server: serverName, tool: lockedToolName });
    }
  }
}

/**
 * Check for servers that were in lockfile but removed
 */
function checkRemovedServers(lockData, currentServers, changes) {
  for (const lockedServerName of Object.keys(lockData.servers)) {
    const stillExists = currentServers.some((s) => s.name === lockedServerName);
    if (!stillExists) {
      changes.push({ type: 'removed_server', server: lockedServerName });
    }
  }
}

/**
 * Render diff changes to terminal
 */
export function renderDiff(changes) {
  if (changes.length === 0) {
    console.log(`  ${kleur.green(S.pass)} No changes detected`);
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
        `  ${kleur.yellow('~')} Tool changed: ${change.server}/${kleur.bold(change.tool)} ${kleur.yellow(S.warn)}`
      );
    }
  }
  console.log('');
}
