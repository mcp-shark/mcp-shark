/**
 * Auto-Fix Engine
 * Orchestrates fix application and renders results.
 * Delegates actual fix logic to FixHandlers.
 */
import kleur from 'kleur';
import { applyFix, createEnvExample, undoFixes } from './FixHandlers.js';
import { S } from './symbols.js';

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
    console.log(`  ${kleur.green(S.pass)} [${index + 1}/${total}] ${fix.message}`);
    if (fix.backupPath) {
      console.log(`          ${kleur.dim(`Backup: ${fix.backupPath}`)}`);
    }
  });

  for (const err of fixResult.errors) {
    console.log(`  ${kleur.red(S.fail)} ${err.finding?.title || 'Fix'}: ${err.error}`);
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
