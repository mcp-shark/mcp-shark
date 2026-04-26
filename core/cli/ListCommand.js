/**
 * List Command
 * Displays a beautiful inventory of all detected MCP servers,
 * their transport type, tool count, and config source.
 */
import Table from 'cli-table3';
import kleur from 'kleur';
import { inspectServerConfigForAauth } from '#core/services/security/aauthParser.js';
import { getAllServers, scanIdeConfigs } from './ConfigScanner.js';
import { TOOL_CLASSIFICATIONS } from './ToolClassifications.js';
import { S } from './symbols.js';

const TRANSPORT_LABELS = {
  stdio: kleur.cyan('stdio'),
  sse: kleur.magenta('sse'),
  http: kleur.yellow('http'),
  streamable: kleur.green('streamable'),
  unknown: kleur.dim('unknown'),
};

/**
 * Execute the list command — server inventory
 * @param {object} options
 * @param {string} [options.format] - Output format: terminal, json
 * @returns {number} Exit code
 */
export function executeList(options = {}) {
  const ideResults = scanIdeConfigs();
  const servers = getAllServers(ideResults);

  if (servers.length === 0) {
    console.log(`\n  ${kleur.yellow(S.warn)} No MCP servers found\n`);
    console.log(kleur.dim('  Searched 15 IDEs. Install an MCP server to get started.'));
    console.log('');
    return 0;
  }

  if (options.format === 'json') {
    return renderJsonInventory(servers, ideResults);
  }

  return renderTerminalInventory(servers, ideResults);
}

/**
 * Render server inventory as a beautiful terminal table
 */
function renderTerminalInventory(servers, ideResults) {
  const foundIdes = ideResults.filter((r) => r.found);

  console.log('');
  console.log(kleur.bold('  MCP Server Inventory'));
  console.log(kleur.dim(`  Found ${servers.length} servers across ${foundIdes.length} IDEs`));
  console.log('');

  const table = new Table({
    head: ['Server', 'IDE', 'Transport', 'Tools', 'Capabilities'].map((h) => kleur.bold(h)),
    chars: {
      top: '─',
      'top-mid': '┬',
      'top-left': '┌',
      'top-right': '┐',
      bottom: '─',
      'bottom-mid': '┴',
      'bottom-left': '└',
      'bottom-right': '┘',
      left: '│',
      'left-mid': '├',
      mid: '─',
      'mid-mid': '┼',
      right: '│',
      'right-mid': '┤',
      middle: '│',
    },
    style: { head: [], border: [] },
  });

  for (const server of servers) {
    const transport = detectTransport(server.config);
    const toolCount = getToolCount(server);
    const capabilities = getServerCapabilities(server.name);

    table.push([
      kleur.white(server.name),
      kleur.dim(server.ide),
      TRANSPORT_LABELS[transport] || TRANSPORT_LABELS.unknown,
      toolCount > 0 ? kleur.bold(String(toolCount)) : kleur.dim('?'),
      capabilities || kleur.dim('—'),
    ]);
  }

  console.log(table.toString());
  console.log('');

  renderAauthSummary(servers);
  renderIdeSummary(ideResults);

  return 0;
}

/**
 * Print a single-line AAuth advertisement summary across all detected servers.
 * Visibility-only: this only checks for AAuth-shaped fields in the static config
 * (agent IDs, JWKS URLs, .well-known/aauth references). It does not connect.
 */
function renderAauthSummary(servers) {
  let advertised = 0;
  for (const server of servers) {
    if (inspectServerConfigForAauth(server.config)) {
      advertised += 1;
    }
  }
  const remaining = servers.length - advertised;
  if (servers.length === 0) {
    return;
  }
  console.log(kleur.bold('  AAuth Visibility'));
  console.log(
    `  ${kleur.green(S.pass)} ${advertised} server${advertised === 1 ? '' : 's'} advertise AAuth · ${kleur.dim(`${remaining} do not`)}`
  );
  console.log(
    kleur.dim(
      '  Observed only — mcp-shark does not verify AAuth identity. See https://www.aauth.dev'
    )
  );
  console.log('');
}

/**
 * Render a summary of which IDEs were detected
 */
function renderIdeSummary(ideResults) {
  const found = ideResults.filter((r) => r.found);
  const notFound = ideResults.filter((r) => !r.found);

  console.log(kleur.bold('  IDE Detection'));
  for (const ide of found) {
    console.log(`  ${kleur.green(S.pass)} ${ide.name} (${ide.serverCount} servers)`);
  }
  if (notFound.length > 0) {
    console.log(`  ${kleur.dim(`${notFound.length} IDEs not installed`)}`);
  }
  console.log('');
}

/**
 * Render inventory as JSON
 */
function renderJsonInventory(servers, ideResults) {
  const output = {
    total_servers: servers.length,
    ides_found: ideResults.filter((r) => r.found).length,
    servers: servers.map((s) => ({
      name: s.name,
      ide: s.ide,
      config_path: s.configPath,
      transport: detectTransport(s.config),
      tool_count: getToolCount(s),
      command: s.config?.command || null,
      args_present: hasArgsPresent(s.config),
      aauth: inspectServerConfigForAauth(s.config),
    })),
  };
  console.log(JSON.stringify(output, null, 2));
  return 0;
}

/**
 * Detect transport type from server config
 */
function detectTransport(config) {
  if (!config) {
    return 'unknown';
  }
  if (config.command) {
    return 'stdio';
  }
  if (config.url?.includes('/sse')) {
    return 'sse';
  }
  if (config.url) {
    return config.transport || 'http';
  }
  if (config.transport) {
    return config.transport;
  }
  return 'unknown';
}

/**
 * Get number of tools for a server
 */
function getToolCount(server) {
  if (Array.isArray(server.tools)) {
    return server.tools.length;
  }
  if (server.tools && typeof server.tools === 'object') {
    return Object.keys(server.tools).length;
  }
  return 0;
}

/**
 * Whether server config includes non-empty args (boolean only for JSON output — avoids leaking secrets).
 */
export function hasArgsPresent(config) {
  const args = config?.args;
  if (args == null) {
    return false;
  }
  if (Array.isArray(args)) {
    return args.length > 0;
  }
  if (typeof args === 'object') {
    return Object.keys(args).length > 0;
  }
  return String(args).length > 0;
}

/**
 * Get known capabilities from the classification database
 * (values are per-tool capability strings, not flat boolean flags)
 */
export function getServerCapabilities(serverName) {
  const classification = TOOL_CLASSIFICATIONS[serverName];
  if (!classification || typeof classification !== 'object') {
    return null;
  }

  const capSet = new Set();
  for (const cap of Object.values(classification)) {
    if (typeof cap === 'string' && cap) {
      capSet.add(cap);
    }
  }

  const caps = [];
  if (capSet.has('reads_secrets')) {
    caps.push(kleur.red('secrets'));
  }
  if (capSet.has('writes_code')) {
    caps.push(kleur.yellow('code'));
  }
  if (capSet.has('sends_external')) {
    caps.push(kleur.magenta('network'));
  }
  if (capSet.has('modifies_infra')) {
    caps.push(kleur.red('infra'));
  }
  if (capSet.has('ingests_untrusted')) {
    caps.push(kleur.cyan('untrusted'));
  }

  return caps.length > 0 ? caps.join(', ') : null;
}
