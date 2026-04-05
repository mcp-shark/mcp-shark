/**
 * Doctor Command
 * Quick environment health check covering IDE configs,
 * environment, security posture, and MCP SDK status
 */
import { existsSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import kleur from 'kleur';
import { scanIdeConfigs } from './ConfigScanner.js';
import { S } from './symbols.js';

const LOCKFILE_NAME = '.mcp-shark.lock';

/**
 * Execute the doctor command
 */
export function executeDoctor() {
  console.log('');
  console.log(kleur.bold('  mcp-shark doctor'));
  console.log('');

  const checks = {
    passed: 0,
    warnings: 0,
    failures: 0,
  };

  runIdeChecks(checks);
  runEnvironmentChecks(checks);
  runSecurityChecks(checks);

  console.log('');
  const summary = [
    kleur.green(`${checks.passed} passed`),
    kleur.yellow(`${checks.warnings} warnings`),
    kleur.red(`${checks.failures} failures`),
  ].join(kleur.dim(` ${S.dot} `));

  console.log(`  ${summary}`);
  console.log('');

  return checks.failures > 0 ? 1 : 0;
}

/**
 * Check IDE installations and configurations
 */
function runIdeChecks(checks) {
  console.log(kleur.bold('  IDE Installations'));

  const ideResults = scanIdeConfigs();

  for (const ide of ideResults) {
    if (ide.found) {
      const details = `${ide.displayPath}, ${ide.serverCount} servers`;
      printPass(ide.name, details);
      checks.passed += 1;
    } else {
      printInfo(ide.name, 'not found');
    }
  }

  console.log('');
}

/**
 * Check Node.js environment
 */
function runEnvironmentChecks(checks) {
  console.log(kleur.bold('  Environment'));

  const nodeVersion = process.version;
  const nodeMajor = Number.parseInt(nodeVersion.slice(1).split('.')[0], 10);

  if (nodeMajor >= 20) {
    printPass(`Node.js ${nodeVersion}`, 'supported');
    checks.passed += 1;
  } else {
    printFail(`Node.js ${nodeVersion}`, 'requires >= 20.0.0');
    checks.failures += 1;
  }

  printPass(`Platform: ${process.platform} ${process.arch}`, '');
  checks.passed += 1;

  console.log('');
}

/**
 * Check security-related configurations
 */
function runSecurityChecks(checks) {
  console.log(kleur.bold('  Security'));

  const ideResults = scanIdeConfigs();
  const foundIdes = ideResults.filter((ide) => ide.found);

  for (const ide of foundIdes) {
    checkFilePermissions(ide, checks);
  }

  checkLockfile(checks);
  checkDuplicateToolNames(foundIdes, checks);

  console.log('');
}

/**
 * Check if config files have overly permissive permissions
 */
function checkFilePermissions(ide, checks) {
  if (process.platform === 'win32') {
    return;
  }
  if (!ide.permissions) {
    return;
  }

  const perms = Number.parseInt(ide.permissions, 8);
  const worldReadable = (perms & 0o004) !== 0;
  const groupReadable = (perms & 0o040) !== 0;

  if (worldReadable || groupReadable) {
    const reason = worldReadable ? 'world-readable' : 'group-readable';
    printWarn(`${ide.displayPath} permissions: ${ide.permissions}`, reason);
    checks.warnings += 1;
  } else {
    printPass(`${ide.displayPath} permissions: ${ide.permissions}`, 'restricted');
    checks.passed += 1;
  }
}

/**
 * Check for lockfile presence
 */
function checkLockfile(checks) {
  const lockfilePath = join(process.cwd(), LOCKFILE_NAME);
  const homeLockfile = join(homedir(), LOCKFILE_NAME);

  if (existsSync(lockfilePath) || existsSync(homeLockfile)) {
    const path = existsSync(lockfilePath) ? lockfilePath : homeLockfile;
    try {
      const stats = statSync(path);
      const ageMs = Date.now() - stats.mtimeMs;
      const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));

      if (ageDays > 30) {
        printWarn(`${LOCKFILE_NAME} is ${ageDays} days old`, 'consider refreshing');
        checks.warnings += 1;
      } else {
        printPass(`${LOCKFILE_NAME} found`, `${ageDays} days old`);
        checks.passed += 1;
      }
    } catch (_err) {
      printPass(`${LOCKFILE_NAME} found`, '');
      checks.passed += 1;
    }
  } else {
    printWarn(`No ${LOCKFILE_NAME} found`, 'run: npx mcp-shark lock');
    checks.warnings += 1;
  }
}

/**
 * Check for duplicate tool names across servers
 */
function checkDuplicateToolNames(foundIdes, checks) {
  const toolServers = new Map();

  for (const ide of foundIdes) {
    for (const [serverName, serverConfig] of Object.entries(ide.servers)) {
      const tools = serverConfig.tools || [];
      const toolNames = Array.isArray(tools)
        ? tools.map((t) => (typeof t === 'string' ? t : t.name))
        : Object.keys(tools);

      for (const toolName of toolNames) {
        if (!toolServers.has(toolName)) {
          toolServers.set(toolName, []);
        }
        toolServers.get(toolName).push(serverName);
      }
    }
  }

  const duplicates = [...toolServers.entries()].filter(([_name, servers]) => servers.length > 1);

  if (duplicates.length > 0) {
    for (const [name, servers] of duplicates) {
      printWarn(`Duplicate tool "${name}"`, `in ${servers.join(', ')}`);
      checks.warnings += 1;
    }
  } else {
    printPass('No duplicate tool names across servers', '');
    checks.passed += 1;
  }
}

function printPass(label, detail) {
  const detailText = detail ? kleur.dim(` ${detail}`) : '';
  console.log(`    ${kleur.green(S.pass)} ${label}${detailText}`);
}

function printWarn(label, detail) {
  const detailText = detail ? kleur.dim(` (${detail})`) : '';
  console.log(`    ${kleur.yellow(S.warn)} ${label}${detailText}`);
}

function printFail(label, detail) {
  const detailText = detail ? kleur.dim(` (${detail})`) : '';
  console.log(`    ${kleur.red(S.fail)} ${label}${detailText}`);
}

function printInfo(label, detail) {
  const detailText = detail ? kleur.dim(` ${detail}`) : '';
  console.log(`    ${kleur.gray(S.info)} ${label}${detailText}`);
}
