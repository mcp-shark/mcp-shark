/**
 * Fix handler implementations
 * Each handler applies a specific type of auto-fix with backup support
 */
import { chmodSync, copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BACKUP_SUFFIX = '.shark-backup';

/**
 * Apply a single fix based on fix type
 */
export function applyFix(finding, envVarsCollected) {
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
    backupFile(configPath);
    const oldPerms = finding.fix_data?.oldPerms || '644';
    chmodSync(configPath, 0o600);
    return {
      success: true,
      finding,
      message: `Set permissions: ${configPath} ${oldPerms} → 600`,
      backupPath: `${configPath}${BACKUP_SUFFIX}`,
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
export function createEnvExample(envVars, result) {
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
export function undoFixes(findings) {
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
