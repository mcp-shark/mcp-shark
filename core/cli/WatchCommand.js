/**
 * Watch Command
 * Watches MCP config files for changes and re-runs scan automatically.
 * Uses fs.watch for zero-dependency file watching.
 */
import { existsSync, watch } from 'node:fs';
import figures from 'figures';
import kleur from 'kleur';
import { scanIdeConfigs } from './ConfigScanner.js';
import { runScan } from './ScanService.js';
import {
  displayScanBanner,
  formatIdeDiscovery,
  formatSharkScore,
  formatSummaryCounts,
  formatTiming,
} from './output/index.js';

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
    console.log(`\n  ${kleur.yellow(figures.warning)} No MCP config files found to watch\n`);
    return 1;
  }

  console.log('');
  console.log(kleur.bold(`  ${figures.pointer} MCP Shark Watch Mode`));
  console.log(kleur.dim('  Watching for config changes. Press Ctrl+C to stop.\n'));

  for (const { path, ide } of configPaths) {
    console.log(`  ${kleur.green(figures.tick)} Watching: ${kleur.dim(path)} (${ide})`);
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
        console.log(`\n  ${kleur.cyan(figures.pointer)} Change detected in ${ide} config`);
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
}

/**
 * Render findings in compact format for watch mode
 */
function renderCompactFindings(scanResult) {
  const severityIcon = {
    critical: kleur.red(figures.cross),
    high: kleur.yellow(figures.warning),
    medium: kleur.cyan(figures.info),
    low: kleur.dim(figures.bullet),
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
