/**
 * Scan Command
 * Wires ScanService results to CLI output with flag support
 */
import { applyFixes, renderFixResults } from './AutoFixEngine.js';
import { runScan } from './ScanService.js';
import { calculateSharkScore } from './SharkScoreCalculator.js';
import { formatWalkthrough, generateWalkthroughs } from './WalkthroughGenerator.js';
import {
  displayScanBanner,
  formatAsJson,
  formatAsSarif,
  formatCleanServers,
  formatIdeDiscovery,
  formatNextSteps,
  formatServerFindings,
  formatSharkScore,
  formatSummaryCounts,
  formatTiming,
  formatToxicFlows,
} from './output/index.js';

/**
 * Execute the scan command
 * @param {object} options - CLI options from commander
 * @param {boolean} [options.fix] - Auto-fix fixable issues
 * @param {boolean} [options.walkthrough] - Show attack chain narratives
 * @param {boolean} [options.ci] - CI mode (exit code 1 on critical/high)
 * @param {string} [options.format] - Output format: 'json' | 'sarif' | 'terminal'
 * @param {boolean} [options.strict] - Count advisory findings in score
 * @param {string} [options.ide] - Filter to specific IDE
 */
export function executeScan(options = {}) {
  const format = (options.format || 'terminal').toLowerCase();

  const scanResult = runScan({
    ide: options.ide,
    strict: options.strict,
  });

  if (format === 'json') {
    console.log(formatAsJson(buildJsonOutput(scanResult)));
    return exitWithCode(scanResult, options.ci);
  }

  if (format === 'sarif') {
    console.log(formatAsSarif(buildJsonOutput(scanResult)));
    return exitWithCode(scanResult, options.ci);
  }

  renderTerminalOutput(scanResult, options);

  if (options.fix) {
    executeAutoFix(scanResult);
  }

  return exitWithCode(scanResult, options.ci);
}

/**
 * Render the full terminal output
 */
function renderTerminalOutput(scanResult, options) {
  displayScanBanner();
  console.log(formatIdeDiscovery(scanResult.ideResults));
  console.log('');

  renderFindings(scanResult);
  renderToxicFlows(scanResult);
  renderScore(scanResult);

  if (options.walkthrough && scanResult.toxicFlows.length > 0) {
    renderWalkthroughs(scanResult.toxicFlows);
  }

  const hasFixable = scanResult.findings.some((f) => f.fixable);
  const hasFlows = scanResult.toxicFlows.length > 0;
  console.log(formatNextSteps(hasFixable, hasFlows));
  console.log('');
}

/**
 * Render findings grouped by server
 */
function renderFindings(scanResult) {
  for (const [serverName, findings] of Object.entries(scanResult.findingsByServer)) {
    const server = scanResult.servers.find((s) => s.name === serverName);
    const ideName = server ? server.ide : 'unknown';
    console.log(formatServerFindings(serverName, ideName, findings));
  }

  if (scanResult.cleanServers.length > 0) {
    console.log(formatCleanServers(scanResult.cleanServers));
  }
}

/**
 * Render toxic flows section
 */
function renderToxicFlows(scanResult) {
  if (scanResult.toxicFlows.length > 0) {
    console.log(formatToxicFlows(scanResult.toxicFlows));
  }
}

/**
 * Render score and summary
 */
function renderScore(scanResult) {
  console.log('');
  console.log(formatSharkScore(scanResult.scoreResult));
  console.log(formatSummaryCounts(scanResult.severityCounts, scanResult.toxicFlows.length));
  console.log(
    formatTiming(
      scanResult.elapsedMs,
      scanResult.serverCount,
      scanResult.ruleCount,
      scanResult.totalToolCount
    )
  );
}

/**
 * Render attack walkthroughs
 */
function renderWalkthroughs(toxicFlows) {
  const walkthroughs = generateWalkthroughs(toxicFlows);
  for (const walkthrough of walkthroughs) {
    console.log(formatWalkthrough(walkthrough));
  }
}

/**
 * Execute auto-fix and show before/after score
 */
function executeAutoFix(scanResult) {
  const scoreBefore = scanResult.scoreResult.score;
  const fixResult = applyFixes(scanResult.findings);

  const remainingFindings = scanResult.findings.filter(
    (f) => !fixResult.fixed.some((fx) => fx.finding === f)
  );
  const scoreAfterResult = calculateSharkScore(remainingFindings, scanResult.toxicFlows);
  const scoreAfter = scoreAfterResult.score;

  renderFixResults(fixResult, scoreBefore, scoreAfter);
}

/**
 * Build structured JSON output
 */
function buildJsonOutput(scanResult) {
  return {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    score: scanResult.scoreResult,
    findings: scanResult.findings,
    toxicFlows: scanResult.toxicFlows,
    servers: scanResult.servers.map((s) => ({
      name: s.name,
      ide: s.ide,
      configPath: s.configPath,
    })),
    summary: {
      serverCount: scanResult.serverCount,
      ruleCount: scanResult.ruleCount,
      toolCount: scanResult.totalToolCount,
      elapsedMs: scanResult.elapsedMs,
      severityCounts: scanResult.severityCounts,
    },
  };
}

/**
 * Exit with appropriate code for CI mode
 */
function exitWithCode(scanResult, ciMode) {
  if (!ciMode) {
    return 0;
  }

  const hasCriticalOrHigh = scanResult.findings.some((f) => {
    const severity = (f.severity || f.risk_level || '').toLowerCase();
    return severity === 'critical' || severity === 'high';
  });

  if (hasCriticalOrHigh) {
    return 1;
  }
  return 0;
}
