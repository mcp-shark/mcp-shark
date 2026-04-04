/**
 * HTML Report Generator
 * Produces a self-contained, offline HTML security report.
 * No external CSS/JS dependencies — everything is inlined.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import kleur from 'kleur';
import { S } from './symbols.js';

/**
 * Generate an HTML report from scan results
 * @param {object} scanResult - Full scan result from ScanService
 * @param {string} [outputPath] - Output file path (defaults to cwd/mcp-shark-report.html)
 * @returns {string} Path to generated report
 */
export function generateHtmlReport(scanResult, outputPath) {
  const reportPath = outputPath || join(process.cwd(), 'mcp-shark-report.html');
  const html = buildHtml(scanResult);
  writeFileSync(reportPath, html, 'utf-8');
  console.log(`  ${kleur.green(S.pass)} Report saved: ${reportPath}`);
  return reportPath;
}

/**
 * Build the complete HTML document
 */
function buildHtml(scanResult) {
  const score = scanResult.scoreResult;
  const timestamp = new Date().toISOString();
  const gradeColor = getGradeColor(score.grade);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MCP Shark Security Report</title>
<style>
${getStyles()}
</style>
</head>
<body>
<div class="container">
  <header>
    <h1>MCP Shark Security Report</h1>
    <p class="timestamp">Generated: ${timestamp}</p>
  </header>

  <div class="score-card">
    <div class="score-circle" style="border-color: ${gradeColor}">
      <span class="score-number">${score.score}</span>
      <span class="score-grade" style="color: ${gradeColor}">${score.grade}</span>
    </div>
    <div class="score-details">
      <h2>Shark Score</h2>
      <p>${score.score}/100 — Grade ${score.grade}</p>
      <p class="score-summary">${scanResult.findings.length} findings across ${scanResult.serverCount} servers</p>
    </div>
  </div>

  <div class="summary-bar">
    ${renderSummaryBadges(scanResult.severityCounts)}
    <span class="badge badge-flow">${scanResult.toxicFlows.length} toxic flows</span>
  </div>

  <section class="findings">
    <h2>Findings</h2>
    ${renderFindingsHtml(scanResult.findings)}
  </section>

  ${renderToxicFlowsHtml(scanResult.toxicFlows)}

  <section class="servers">
    <h2>Servers Scanned</h2>
    <table>
      <thead><tr><th>Server</th><th>IDE</th><th>Findings</th></tr></thead>
      <tbody>
        ${renderServersTable(scanResult)}
      </tbody>
    </table>
  </section>

  <footer>
    <p>mcp-shark v${getVersion()} — ${scanResult.ruleCount} rules · ${scanResult.elapsedMs}ms scan time · 100% local</p>
  </footer>
</div>
</body>
</html>`;
}

function getStyles() {
  return `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#0d1117;color:#c9d1d9;line-height:1.6}
.container{max-width:900px;margin:0 auto;padding:2rem}
header{text-align:center;margin-bottom:2rem}
header h1{font-size:2rem;color:#58a6ff}
.timestamp{color:#8b949e;font-size:.85rem}
.score-card{display:flex;align-items:center;gap:2rem;background:#161b22;border:1px solid #30363d;border-radius:12px;padding:2rem;margin-bottom:1.5rem}
.score-circle{width:100px;height:100px;border-radius:50%;border:4px solid;display:flex;flex-direction:column;align-items:center;justify-content:center}
.score-number{font-size:2rem;font-weight:bold;color:#fff}
.score-grade{font-size:1rem;font-weight:bold}
.score-details h2{color:#f0f6fc}
.score-summary{color:#8b949e}
.summary-bar{display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:2rem}
.badge{padding:.25rem .75rem;border-radius:20px;font-size:.8rem;font-weight:600}
.badge-critical{background:#da3633;color:#fff}
.badge-high{background:#d29922;color:#fff}
.badge-medium{background:#1f6feb;color:#fff}
.badge-low{background:#30363d;color:#8b949e}
.badge-flow{background:#8957e5;color:#fff}
h2{color:#f0f6fc;margin:1.5rem 0 1rem;font-size:1.3rem}
.finding{background:#161b22;border:1px solid #30363d;border-radius:8px;padding:1rem;margin-bottom:.75rem}
.finding-header{display:flex;justify-content:space-between;align-items:center}
.finding-title{font-weight:600;color:#f0f6fc}
.sev{padding:.15rem .5rem;border-radius:4px;font-size:.75rem;font-weight:600;text-transform:uppercase}
.sev-critical{background:#da3633;color:#fff}
.sev-high{background:#d29922;color:#fff}
.sev-medium{background:#1f6feb;color:#fff}
.sev-low{background:#30363d;color:#8b949e}
.finding-desc{color:#8b949e;margin-top:.5rem;font-size:.9rem}
.finding-meta{color:#484f58;font-size:.8rem;margin-top:.25rem}
.toxic-flow{background:#1c1229;border:1px solid #8957e5;border-radius:8px;padding:1rem;margin-bottom:.75rem}
.flow-chain{color:#d2a8ff;font-weight:600}
table{width:100%;border-collapse:collapse;background:#161b22;border-radius:8px;overflow:hidden}
th{background:#21262d;color:#f0f6fc;text-align:left;padding:.75rem 1rem;font-size:.85rem}
td{padding:.75rem 1rem;border-top:1px solid #30363d;font-size:.9rem}
footer{text-align:center;margin-top:3rem;color:#484f58;font-size:.8rem}`;
}

function getGradeColor(grade) {
  const colors = { A: '#3fb950', B: '#56d364', C: '#d29922', D: '#db6d28', F: '#da3633' };
  return colors[grade] || '#8b949e';
}

function renderSummaryBadges(counts) {
  return ['critical', 'high', 'medium', 'low']
    .filter((s) => (counts[s] || 0) > 0)
    .map((s) => `<span class="badge badge-${s}">${counts[s]} ${s}</span>`)
    .join('\n    ');
}

function renderFindingsHtml(findings) {
  if (findings.length === 0) {
    return '<p style="color:#3fb950">No security issues found.</p>';
  }
  return findings
    .map((f) => {
      const sev = (f.severity || 'medium').toLowerCase();
      return `<div class="finding">
      <div class="finding-header">
        <span class="finding-title">${escapeHtml(f.title)}</span>
        <span class="sev sev-${sev}">${sev}</span>
      </div>
      <div class="finding-desc">${escapeHtml(f.description || '')}</div>
      <div class="finding-meta">${f.rule_id || ''} · ${f.server_name || ''} · ${f.ide || ''}</div>
    </div>`;
    })
    .join('\n  ');
}

function renderToxicFlowsHtml(flows) {
  if (flows.length === 0) {
    return '';
  }
  const items = flows
    .map(
      (f) => `<div class="toxic-flow">
      <div class="flow-chain">${escapeHtml(f.chain || `${f.source} → ${f.sink}`)}</div>
      <div class="finding-desc">${escapeHtml(f.scenario || f.description || '')}</div>
    </div>`
    )
    .join('\n  ');
  return `<section><h2>Toxic Flows</h2>${items}</section>`;
}

function renderServersTable(scanResult) {
  return scanResult.servers
    .map((s) => {
      const count = scanResult.findings.filter((f) => f.server_name === s.name).length;
      return `<tr><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.ide)}</td><td>${count}</td></tr>`;
    })
    .join('\n        ');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getVersion() {
  try {
    const pkgPath = join(import.meta.dirname, '..', '..', 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    return pkg.version;
  } catch (_err) {
    return '1.x';
  }
}
