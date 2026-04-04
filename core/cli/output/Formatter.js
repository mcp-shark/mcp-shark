/**
 * Terminal output formatter for scan results
 * Renders findings, toxic flows, and summaries with colors
 */
import kleur from 'kleur';
import { S } from '../symbols.js';

const SEVERITY_COLORS = {
  critical: (text) => kleur.bgRed().white().bold(` ${text} `),
  high: (text) => kleur.red().bold(text),
  medium: (text) => kleur.yellow(text),
  low: (text) => kleur.blue(text),
};

const SEVERITY_LABELS = {
  critical: 'CRIT',
  high: 'HIGH',
  medium: 'MED ',
  low: 'LOW ',
};

/**
 * Format a single finding for terminal output
 */
export function formatFinding(finding) {
  const severity = (finding.severity || finding.risk_level || 'medium').toLowerCase();
  const label = SEVERITY_LABELS[severity] || 'INFO';
  const colorFn = SEVERITY_COLORS[severity] || kleur.gray;
  const confidence = finding.confidence === 'possible' ? 'advisory' : 'confirmed';
  const confidenceColor = confidence === 'confirmed' ? kleur.white : kleur.gray;

  const ruleId = finding.rule_id || finding.category || '';
  const ruleDisplay = ruleId.toUpperCase().replace(/-/g, '').slice(0, 5);

  const message = finding.title || finding.description || finding.message || '';

  return `    ${colorFn(label)}  ${kleur.dim(ruleDisplay)}  ${message}  ${confidenceColor(confidence)}`;
}

/**
 * Format findings grouped by server
 */
export function formatServerFindings(serverName, ideName, findings) {
  const lines = [];
  const header = kleur.bold(`  ${serverName}`) + kleur.dim(` (${ideName})`);
  lines.push(header);

  for (const finding of findings) {
    lines.push(formatFinding(finding));
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * Format clean servers summary
 */
export function formatCleanServers(cleanServerNames) {
  if (cleanServerNames.length === 0) {
    return '';
  }
  const names = cleanServerNames.join(', ');
  return `  ${names} ${kleur.green(`${S.bar} clean ${S.pass}`)}\n`;
}

/**
 * Format toxic flow section
 */
export function formatToxicFlows(flows) {
  if (flows.length === 0) {
    return '';
  }

  const lines = [];
  lines.push(`  ${kleur.dim(S.bar.repeat(65))}`);
  lines.push(`  ${kleur.bold('Toxic Flows')}`);
  lines.push(`  ${kleur.dim(S.bar.repeat(65))}`);
  lines.push('');

  for (const flow of flows) {
    const riskColor = flow.risk === 'HIGH' ? kleur.red : kleur.yellow;
    lines.push(
      `  ${riskColor(`${S.warn} ${flow.risk}`)}  ${kleur.bold(flow.source)} ${kleur.dim(S.arrow)} ${kleur.bold(flow.target)}`
    );
    lines.push(`    ${flow.scenario}`);
    lines.push(`    ${kleur.dim(`(Catalog ${flow.catalog})`)}`);
    lines.push('');
  }

  lines.push(`  ${kleur.dim(S.bar.repeat(65))}`);
  return lines.join('\n');
}

/**
 * Format the Shark Score display
 */
export function formatSharkScore(scoreResult) {
  const { score, grade } = scoreResult;

  const gradeColors = {
    A: kleur.green,
    B: kleur.green,
    C: kleur.yellow,
    D: kleur.red,
    F: kleur.bgRed().white,
  };

  const colorFn = gradeColors[grade] || kleur.white;
  return `  Shark Score: ${colorFn(`${score}/100 (${grade})`)}`;
}

/**
 * Format the summary counts line
 */
export function formatSummaryCounts(counts, flowCount) {
  const parts = [];
  if (counts.critical > 0) {
    parts.push(kleur.red(`${counts.critical} critical`));
  }
  if (counts.high > 0) {
    parts.push(kleur.red(`${counts.high} high`));
  }
  if (counts.medium > 0) {
    parts.push(kleur.yellow(`${counts.medium} medium`));
  }
  if (counts.low > 0) {
    parts.push(kleur.blue(`${counts.low} low`));
  }
  if (flowCount > 0) {
    parts.push(kleur.red(`${flowCount} toxic flows`));
  }

  if (parts.length === 0) {
    return `  ${kleur.green(`${S.pass} No issues found`)}`;
  }

  return `  ${parts.join(kleur.dim(` ${S.dot} `))}`;
}

/**
 * Format completion timing
 */
export function formatTiming(elapsedMs, serverCount, ruleCount, toolCount) {
  const seconds = (elapsedMs / 1000).toFixed(1);
  return kleur.dim(
    `  Completed in ${seconds}s ${S.dot} ${serverCount} servers ${S.dot} ${ruleCount} rules ${S.dot} ${toolCount} tools checked`
  );
}

/**
 * Format next steps suggestions
 */
export function formatNextSteps(hasFixable, hasFlows) {
  const lines = [];
  lines.push('');
  lines.push(kleur.dim('  Next steps:'));

  if (hasFixable) {
    lines.push(`    ${kleur.cyan('npx mcp-shark scan --fix')}          Auto-fix fixable issues`);
  }
  if (hasFlows) {
    lines.push(`    ${kleur.cyan('npx mcp-shark scan --walkthrough')}  See full attack chains`);
  }
  lines.push(`    ${kleur.cyan('npx mcp-shark lock')}                Pin tool definitions`);

  return lines.join('\n');
}

/**
 * Format IDE discovery line
 */
export function formatIdeDiscovery(ideResults) {
  const found = ideResults.filter((ide) => ide.found);
  const names = found.map((ide) => ide.name);
  const serverCount = found.reduce((sum, ide) => sum + ide.serverCount, 0);

  if (names.length === 0) {
    return `  ${kleur.yellow(`${S.warn} No MCP configurations found`)}`;
  }

  return kleur.dim(`  Scanning ${serverCount} servers across ${names.join(', ')}...`);
}
