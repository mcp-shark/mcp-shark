/**
 * TUI Servers Panel — Server inventory with finding counts
 */
import { Box, Text } from 'ink';
import { h } from './h.js';

export function ServersPanel({ servers, findings, selectedIndex }) {
  if (servers.length === 0) {
    return h(
      Box,
      { padding: 1 },
      h(Text, { color: 'yellow' }, '⚠ No MCP servers detected across 15 IDEs.')
    );
  }

  const clamped = Math.min(selectedIndex, servers.length - 1);
  const selected = servers[clamped];
  const selectedFindings = findings.filter((f) => f.server_name === selected?.name);

  const rows = servers.map((server, idx) => {
    const isSelected = idx === clamped;
    const count = findings.filter((f) => f.server_name === server.name).length;
    const countColor = count === 0 ? 'green' : count > 3 ? 'red' : 'yellow';

    return h(
      Box,
      { key: `${server.name}-${server.ide}` },
      h(
        Text,
        { inverse: isSelected, color: isSelected ? 'cyan' : 'white' },
        `${isSelected ? '▸' : ' '} ${server.name.padEnd(25)}`
      ),
      h(Text, { inverse: isSelected, color: isSelected ? 'white' : 'gray' }, server.ide.padEnd(15)),
      h(
        Text,
        { inverse: isSelected, color: isSelected ? 'white' : countColor },
        count === 0 ? '✔ clean' : `${count} issues`
      )
    );
  });

  const findingRows = selectedFindings
    .slice(0, 5)
    .map((f) =>
      h(
        Text,
        {
          key: `${f.rule_id}-${f.title}`,
          color: (f.severity || '').toLowerCase() === 'critical' ? 'red' : 'yellow',
        },
        `  ${f.severity?.toUpperCase()} — ${f.title}`
      )
    );

  const moreText =
    selectedFindings.length > 5
      ? h(Text, { color: 'gray' }, `  ... and ${selectedFindings.length - 5} more`)
      : null;

  const detail = selected
    ? h(
        Box,
        { flexDirection: 'column', borderStyle: 'single', borderColor: 'cyan', paddingX: 1 },
        h(Text, { bold: true, color: 'white' }, ` ${selected.name} `),
        h(Text, null, h(Text, { bold: true }, 'IDE:'), ` ${selected.ide}`),
        h(Text, null, h(Text, { bold: true }, 'Config:'), ` ${selected.configPath || '—'}`),
        h(
          Text,
          null,
          h(Text, { bold: true }, 'Transport:'),
          ` ${detectTransport(selected.config)}`
        ),
        h(Text, null, h(Text, { bold: true }, 'Command:'), ` ${selected.config?.command || '—'}`),
        h(
          Text,
          null,
          h(Text, { bold: true }, 'Tools:'),
          ` ${Array.isArray(selected.tools) ? selected.tools.length : '?'}`
        ),
        h(Text, null, h(Text, { bold: true }, 'Findings:'), ` ${selectedFindings.length}`),
        selectedFindings.length > 0
          ? h(Box, { flexDirection: 'column' }, ...findingRows, moreText)
          : null
      )
    : null;

  return h(
    Box,
    { flexDirection: 'column' },
    h(
      Box,
      { flexDirection: 'column', borderStyle: 'single', borderColor: 'gray', paddingX: 1 },
      h(Text, { bold: true, color: 'white' }, ` Servers (${servers.length}) `),
      ...rows
    ),
    detail
  );
}

function detectTransport(config) {
  if (!config) {
    return 'unknown';
  }
  if (config.command) {
    return 'stdio';
  }
  if (config.url) {
    return config.transport || 'http';
  }
  return config.transport || 'unknown';
}
