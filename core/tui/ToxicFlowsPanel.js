/**
 * TUI Toxic Flows Panel — Cross-server attack path visualization
 */
import { Box, Text } from 'ink';
import { h } from './h.js';

export function ToxicFlowsPanel({ toxicFlows, selectedIndex }) {
  if (toxicFlows.length === 0) {
    return h(
      Box,
      { padding: 1 },
      h(Text, { color: 'green' }, '✔ No toxic cross-server flows detected.')
    );
  }

  const clamped = Math.min(selectedIndex, toxicFlows.length - 1);
  const selected = toxicFlows[clamped];

  const rows = toxicFlows.map((flow, idx) => {
    const isSelected = idx === clamped;
    const riskColor = (flow.risk || '').toLowerCase() === 'high' ? 'red' : 'yellow';
    const flowKey = `${flow.source}-${flow.sink}-${flow.rule || idx}`;

    return h(
      Box,
      { key: flowKey },
      h(
        Text,
        { inverse: isSelected, color: isSelected ? 'magenta' : riskColor },
        `${isSelected ? '▸' : ' '} ${(flow.risk || 'MED').toUpperCase().padEnd(6)}`
      ),
      h(
        Text,
        { inverse: isSelected, color: isSelected ? 'white' : 'gray' },
        ` ${flow.source || '?'} → ${flow.sink || '?'}`
      ),
      h(
        Text,
        { inverse: isSelected, color: isSelected ? 'white' : 'gray', dimColor: !isSelected },
        ` — ${truncate(flow.scenario || '', 50)}`
      )
    );
  });

  const caps = selected?.capabilities
    ? Object.entries(selected.capabilities)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(', ')
    : '—';

  const detail = selected
    ? h(
        Box,
        { flexDirection: 'column', borderStyle: 'single', borderColor: 'magenta', paddingX: 1 },
        h(Text, { bold: true, color: 'magenta' }, ' Flow Detail '),
        h(
          Text,
          null,
          h(Text, { bold: true, color: 'red' }, selected.source),
          h(Text, { color: 'gray' }, ' → '),
          h(Text, { bold: true, color: 'red' }, selected.sink)
        ),
        h(
          Text,
          null,
          h(Text, { bold: true }, 'Risk:'),
          ' ',
          h(Text, { color: selected.risk === 'high' ? 'red' : 'yellow' }, selected.risk)
        ),
        h(Text, null, h(Text, { bold: true }, 'Rule:'), ` ${selected.rule || '—'}`),
        h(
          Text,
          { wrap: 'wrap' },
          h(Text, { bold: true }, 'Scenario:'),
          ` ${selected.scenario || '—'}`
        ),
        h(Text, { wrap: 'wrap' }, h(Text, { bold: true }, 'Capabilities:'), ` ${caps}`)
      )
    : null;

  return h(
    Box,
    { flexDirection: 'column' },
    h(
      Box,
      { flexDirection: 'column', borderStyle: 'single', borderColor: 'magenta', paddingX: 1 },
      h(Text, { bold: true, color: 'white' }, ` Toxic Flows (${toxicFlows.length}) `),
      ...rows
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
