/**
 * TUI Help Bar — Keyboard shortcuts displayed at the bottom
 */
import { Box, Text } from 'ink';
import { h } from './h.js';

const COMMON_KEYS = [
  { key: 'j/k', desc: 'navigate' },
  { key: 'Tab', desc: 'next panel' },
  { key: '1-4', desc: 'panel' },
  { key: 'r', desc: 'rescan' },
  { key: 'q', desc: 'quit' },
];

const PANEL_KEYS = {
  findings: [],
  servers: [],
  flows: [],
  fix: [
    { key: 'f', desc: 'fix all' },
    { key: 'u', desc: 'undo' },
  ],
};

export function HelpBar({ activePanel }) {
  const panelSpecific = PANEL_KEYS[activePanel] || [];
  const allKeys = [...panelSpecific, ...COMMON_KEYS];

  return h(
    Box,
    { paddingX: 1 },
    ...allKeys.map(({ key, desc }, idx) =>
      h(
        Box,
        { key, marginRight: 1 },
        h(Text, { bold: true, color: 'cyan' }, key),
        h(Text, { color: 'gray' }, ` ${desc}`),
        idx < allKeys.length - 1 ? h(Text, { color: 'gray' }, ' │') : null
      )
    )
  );
}
