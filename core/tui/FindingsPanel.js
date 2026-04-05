/**
 * TUI Findings Panel — Scrollable list of security findings with detail view
 */
import { Box, Text } from 'ink';
import { h } from './h.js';

const SEVERITY_COLORS = { critical: 'red', high: 'yellow', medium: 'blue', low: 'gray' };
const SEVERITY_ICONS = { critical: '✖', high: '▲', medium: '●', low: '○' };
const VISIBLE_ROWS = 15;

export function FindingsPanel({ findings, selectedIndex }) {
  if (findings.length === 0) {
    return h(
      Box,
      { padding: 1 },
      h(Text, { color: 'green' }, '✔ No security issues found. Your MCP setup looks clean.')
    );
  }

  const clamped = Math.min(selectedIndex, findings.length - 1);
  const scrollOffset = Math.max(0, clamped - VISIBLE_ROWS + 3);
  const visible = findings.slice(scrollOffset, scrollOffset + VISIBLE_ROWS);
  const selected = findings[clamped];

  const rows = visible.map((finding, idx) => {
    const actualIdx = scrollOffset + idx;
    const isSelected = actualIdx === clamped;
    const sev = (finding.severity || 'medium').toLowerCase();
    const color = SEVERITY_COLORS[sev] || 'white';
    const icon = SEVERITY_ICONS[sev] || '●';

    return h(
      Box,
      { key: finding.rule_id + finding.title + actualIdx },
      h(
        Text,
        { inverse: isSelected, color: isSelected ? 'cyan' : color },
        `${isSelected ? '▸' : ' '} ${icon} ${sev.toUpperCase().padEnd(8)}`
      ),
      h(
        Text,
        { inverse: isSelected, color: isSelected ? 'white' : 'gray' },
        ` ${truncate(finding.title, 70)}`
      )
    );
  });

  const scrollInfo =
    findings.length > VISIBLE_ROWS
      ? h(
          Text,
          { color: 'gray', dimColor: true },
          `${scrollOffset > 0 ? '↑ ' : '  '}${scrollOffset + VISIBLE_ROWS < findings.length ? '↓ scroll' : '  end'} (${clamped + 1}/${findings.length})`
        )
      : null;

  const detail = selected
    ? h(
        Box,
        { flexDirection: 'column', borderStyle: 'single', borderColor: 'cyan', paddingX: 1 },
        h(Text, { bold: true, color: 'white' }, ' Detail '),
        h(Text, null, h(Text, { bold: true }, 'Rule:'), ` ${selected.rule_id || '—'}`),
        h(
          Text,
          null,
          h(Text, { bold: true }, 'Severity:'),
          ' ',
          h(
            Text,
            { color: SEVERITY_COLORS[(selected.severity || '').toLowerCase()] },
            selected.severity
          )
        ),
        h(Text, null, h(Text, { bold: true }, 'Server:'), ` ${selected.server_name || '—'}`),
        h(Text, null, h(Text, { bold: true }, 'IDE:'), ` ${selected.ide || '—'}`),
        h(
          Text,
          { wrap: 'wrap' },
          h(Text, { bold: true }, 'Description:'),
          ` ${selected.description || '—'}`
        ),
        selected.recommendation
          ? h(
              Text,
              { wrap: 'wrap' },
              h(Text, { bold: true }, 'Fix:'),
              ` ${selected.recommendation}`
            )
          : null,
        selected.fixable
          ? h(Text, { color: 'green' }, '✔ Auto-fixable — press 4 to go to Fix panel')
          : null
      )
    : null;

  return h(
    Box,
    { flexDirection: 'column' },
    h(
      Box,
      { flexDirection: 'column', borderStyle: 'single', borderColor: 'gray', paddingX: 1 },
      h(Text, { bold: true, color: 'white' }, ` Findings (${findings.length}) `),
      ...rows,
      scrollInfo
    ),
    detail
  );
}

function truncate(str, maxLen) {
  if (!str) {
    return '';
  }
  return str.length > maxLen ? `${str.slice(0, maxLen - 1)}…` : str;
}
