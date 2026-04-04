/**
 * Watch Command
 * Watches MCP config files for changes and re-runs scan automatically.
 * Uses fs.watch for zero-dependency file watching.
 */
import { existsSync, watch } from 'node:fs';
import kleur from 'kleur';
import { resetStaticRulesCache } from '#core/services/security/StaticRulesService.js';
import { scanIdeConfigs } from './ConfigScanner.js';
import { runScan } from './ScanService.js';
import {
  displayScanBanner,
  formatIdeDiscovery,
  formatSharkScore,
  formatSummaryCounts,
  formatTiming,
} from './output/index.js';
import { S } from './symbols.js';

const DEBOUNCE_MS = 1000;

/**
 * Execute the watch command
 * @returns {number} Exit code (never returns unless error)
 */
export function executeWatch() {
  const ideResults = scanIdeConfigs();
  const configPaths = ideResults
    .filter((r) => r.found && r.configPath)
    .map((r) => ({ path: r.configPath, ide: r.name }));

  if (configPaths.length === 0) {
    console.log(`\n  ${kleur.yellow(S.warn)} No MCP config files found to watch\n`);
    return 1;
  }

  console.log('');
  console.log(kleur.bold('  mcp-shark watch'));
  console.log(kleur.dim('  Watching for config changes. Press Ctrl+C to stop.\n'));

  for (const { path, ide } of configPaths) {
    console.log(`  ${kleur.green(S.pass)} Watching: ${kleur.dim(path)} (${ide})`);
  }
  console.log('');

  runAndDisplay();

  const debounceState = { timer: null };

  for (const { path: configPath, ide } of configPaths) {
    if (!existsSync(configPath)) {
      continue;
    }

    watch(configPath, (_eventType) => {
      if (debounceState.timer) {
        clearTimeout(debounceState.timer);
      }
      debounceState.timer = setTimeout(() => {
        console.log(`\n  ${kleur.cyan(S.pointer)} Change detected in ${ide} config`);
        console.log(kleur.dim(`  ${configPath}`));
        console.log('');
        runAndDisplay();
      }, DEBOUNCE_MS);
    });
  }

  return 0;
}

/**
 * Run scan and display compact results
 */
function runAndDisplay() {
  try {
    resetStaticRulesCache();
    const scanResult = runScan({});

    displayScanBanner();
    console.log(formatIdeDiscovery(scanResult.ideResults));
    console.log('');

    const findingCount = scanResult.findings.length;
    const flowCount = scanResult.toxicFlows.length;

    if (findingCount > 0) {
      renderCompactFindings(scanResult);
    }

    console.log('');
    console.log(formatSharkScore(scanResult.scoreResult));
    console.log(formatSummaryCounts(scanResult.severityCounts, flowCount));
    console.log(
      formatTiming(
        scanResult.elapsedMs,
        scanResult.serverCount,
        scanResult.ruleCount,
        scanResult.totalToolCount
      )
    );
    console.log('');
    console.log(kleur.dim(`  Watching for changes... (${new Date().toLocaleTimeString()})`));
  } catch (err) {
    console.log(`\n  ${kleur.red(S.fail)} Scan failed: ${err.message}\n`);
  }
}

/**
 * Render findings in compact format for watch mode
 */
function renderCompactFindings(scanResult) {
  const severityIcon = {
    critical: kleur.red(S.fail),
    high: kleur.yellow(S.warn),
    medium: kleur.cyan(S.info),
    low: kleur.dim(S.dot),
  };

  for (const finding of scanResult.findings.slice(0, 10)) {
    const sev = (finding.severity || 'medium').toLowerCase();
    const icon = severityIcon[sev] || severityIcon.medium;
    console.log(`  ${icon} ${kleur.bold(finding.title)}`);
  }

  const remaining = scanResult.findings.length - 10;
  if (remaining > 0) {
    console.log(kleur.dim(`  ... and ${remaining} more findings`));
  }
}
