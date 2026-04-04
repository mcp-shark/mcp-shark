/**
 * Auto-Fix Engine
 * Applies safe, reversible fixes to MCP configuration issues.
 * Every fix creates a backup. Every fix can be undone.
 *
 * Supported fixes:
 *   - Hardcoded secrets → environment variable references
 *   - World-readable config → chmod 600
 *   - Missing .env.example → generate template
 */
import { chmodSync, copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import figures from 'figures';
import kleur from 'kleur';

const BACKUP_SUFFIX = '.shark-backup';

/**
 * Apply fixes for all fixable findings
 * @param {Array} findings - Findings from ScanService
 * @param {object} options
 * @param {boolean} [options.undo] - Undo previous fixes
 * @returns {{ fixed: Array, skipped: Array, errors: Array }}
 */
export function applyFixes(findings, options = {}) {
  if (options.undo) {
    return undoFixes(findings);
  }

  const fixable = findings.filter((f) => f.fixable);
  const result = { fixed: [], skipped: [], errors: [] };

  const envVarsCollected = [];

  for (const finding of fixable) {
    const fixResult = applyFix(finding, envVarsCollected);
    if (fixResult.success) {
      result.fixed.push(fixResult);
    } else if (fixResult.error) {
      result.errors.push(fixResult);
    } else {
      result.skipped.push(fixResult);
    }
  }

  if (envVarsCollected.length > 0) {
    createEnvExample(envVarsCollected, result);
  }

  return result;
}

/**
 * Apply a single fix based on fix type
 */
function applyFix(finding, envVarsCollected) {
  if (finding.fix_type === 'env_var_replacement') {
    return fixEnvVarReplacement(finding, envVarsCollected);
  }
  if (finding.fix_type === 'chmod') {
    return fixPermissions(finding);
  }
  if (finding.fix_type === 'strip_ansi') {
    return fixStripAnsi(finding);
  }
  return { success: false, finding, reason: 'Unknown fix type' };
}

/**
 * Replace hardcoded secret with environment variable reference
 */
function fixEnvVarReplacement(finding, envVarsCollected) {
  const configPath = finding.config_path;
  if (!configPath || !existsSync(configPath)) {
    return { success: false, finding, error: 'Config file not found' };
  }

  try {
    const envVarName = deriveEnvVarName(finding.fix_data.key);
    backupFile(configPath);

    const content = readFileSync(configPath, 'utf-8');
    const original = finding.fix_data.original;
    const replacement = `\${${envVarName}}`;
    const updated = content.replace(original, replacement);

    if (updated === content) {
      return { success: false, finding, reason: 'Value not found in config' };
    }

    writeFileSync(configPath, updated, 'utf-8');
    envVarsCollected.push({ name: envVarName, original: maskValue(original) });

    return {
      success: true,
      finding,
      message: `Replaced ${maskValue(original)} → \${${envVarName}}`,
      backupPath: `${configPath}${BACKUP_SUFFIX}`,
    };
  } catch (err) {
    return { success: false, finding, error: err.message };
  }
}

/**
 * Fix file permissions (chmod 600)
 */
function fixPermissions(finding) {
  const configPath = finding.config_path;
  if (!configPath || !existsSync(configPath)) {
    return { success: false, finding, error: 'Config file not found' };
  }

  if (process.platform === 'win32') {
    return { success: false, finding, reason: 'chmod not supported on Windows' };
  }

  try {
    const oldPerms = finding.fix_data?.oldPerms || '644';
    chmodSync(configPath, 0o600);
    return {
      success: true,
      finding,
      message: `Set permissions: ${configPath} ${oldPerms} → 600`,
    };
  } catch (err) {
    return { success: false, finding, error: err.message };
  }
}

/**
 * Strip ANSI escape sequences from tool description
 */
function fixStripAnsi(finding) {
  const configPath = finding.config_path;
  if (!configPath || !existsSync(configPath)) {
    return { success: false, finding, error: 'Config file not found' };
  }

  try {
    backupFile(configPath);
    const content = readFileSync(configPath, 'utf-8');
    const escChar = String.fromCharCode(0x1b);
    const ansiPattern = new RegExp(`${escChar}\\[[0-9;]*m`, 'g');
    const stripped = content.replace(ansiPattern, '');

    if (stripped === content) {
      return { success: false, finding, reason: 'No ANSI sequences found' };
    }

    writeFileSync(configPath, stripped, 'utf-8');
    return {
      success: true,
      finding,
      message: 'Stripped ANSI escape sequences from config',
      backupPath: `${configPath}${BACKUP_SUFFIX}`,
    };
  } catch (err) {
    return { success: false, finding, error: err.message };
  }
}

/**
 * Create .env.example with required environment variable names
 */
function createEnvExample(envVars, result) {
  const envExamplePath = join(process.cwd(), '.env.example');
  const existingContent = existsSync(envExamplePath) ? readFileSync(envExamplePath, 'utf-8') : '';

  const newVars = envVars.filter((v) => !existingContent.includes(v.name));

  if (newVars.length === 0) {
    return;
  }

  const lines = newVars.map((v) => `${v.name}=`);
  const content = existingContent
    ? `${existingContent.trimEnd()}\n${lines.join('\n')}\n`
    : `${lines.join('\n')}\n`;

  try {
    writeFileSync(envExamplePath, content, 'utf-8');
    result.fixed.push({
      success: true,
      finding: { title: 'Created .env.example' },
      message: `Created .env.example with ${newVars.map((v) => v.name).join(', ')}`,
    });
  } catch (err) {
    result.errors.push({
      success: false,
      finding: { title: 'Create .env.example' },
      error: err.message,
    });
  }
}

/**
 * Undo previous fixes by restoring backups
 */
function undoFixes(findings) {
  const result = { fixed: [], skipped: [], errors: [] };

  const configPaths = new Set(findings.filter((f) => f.config_path).map((f) => f.config_path));

  for (const configPath of configPaths) {
    const backupPath = `${configPath}${BACKUP_SUFFIX}`;
    if (!existsSync(backupPath)) {
      result.skipped.push({
        success: false,
        reason: 'No backup found',
        finding: { config_path: configPath },
      });
      continue;
    }

    try {
      copyFileSync(backupPath, configPath);
      result.fixed.push({
        success: true,
        message: `Restored ${configPath} from backup`,
        finding: { config_path: configPath },
      });
    } catch (err) {
      result.errors.push({
        success: false,
        error: err.message,
        finding: { config_path: configPath },
      });
    }
  }

  return result;
}

/**
 * Create a backup of a file before modifying it
 */
function backupFile(filePath) {
  const backupPath = `${filePath}${BACKUP_SUFFIX}`;
  if (!existsSync(backupPath)) {
    copyFileSync(filePath, backupPath);
  }
}

/**
 * Derive environment variable name from a config key
 */
function deriveEnvVarName(key) {
  return key
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .toUpperCase();
}

/**
 * Mask a secret value for display
 */
function maskValue(value) {
  if (!value || value.length <= 8) {
    return '****';
  }
  return `${value.slice(0, 4)}****`;
}

/**
 * Render fix results to terminal
 */
export function renderFixResults(fixResult, scoreBefore, scoreAfter) {
  const total = fixResult.fixed.length;

  if (total === 0) {
    console.log(`  ${kleur.dim('No auto-fixable issues found')}`);
    return;
  }

  console.log('');
  console.log(kleur.bold('  Applying fixes...'));
  console.log('');

  fixResult.fixed.forEach((fix, index) => {
    console.log(`  ${kleur.green(figures.tick)} [${index + 1}/${total}] ${fix.message}`);
    if (fix.backupPath) {
      console.log(`          ${kleur.dim(`Backup: ${fix.backupPath}`)}`);
    }
  });

  for (const err of fixResult.errors) {
    console.log(`  ${kleur.red(figures.cross)} ${err.finding?.title || 'Fix'}: ${err.error}`);
  }

  const remaining = fixResult.skipped.length + fixResult.errors.length;
  console.log('');
  console.log(`  ${total} fixed · ${remaining} remaining (manual fix needed)`);

  if (scoreBefore !== null && scoreAfter !== null) {
    const diff = scoreAfter - scoreBefore;
    const bar = renderProgressBar(scoreAfter);
    console.log(`  Shark Score: ${scoreBefore} → ${scoreAfter} (+${diff} points) ${bar}`);
  }

  console.log('');
  console.log(kleur.dim('  Undo all: npx mcp-shark scan --fix --undo'));
}

/**
 * Render a simple progress bar
 */
function renderProgressBar(score) {
  const filled = Math.round((score / 100) * 30);
  const empty = 30 - filled;
  return kleur.green('█'.repeat(filled)) + kleur.dim('░'.repeat(empty));
}
