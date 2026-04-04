import { Box, Text, useInput } from 'ink';
/**
 * TUI Fix Panel — Auto-fix interface with interactive selection
 */
import { useState } from 'react';
import { applyFixes } from '#core/cli/AutoFixEngine.js';
import { h } from './h.js';

export function FixPanel({ findings, onRescan }) {
  const fixable = findings.filter((f) => f.fixable);
  const [fixResult, setFixResult] = useState(null);
  const [confirming, setConfirming] = useState(false);

  useInput((input) => {
    if (confirming) {
      if (input === 'y') {
        const result = applyFixes(findings);
        setFixResult(result);
        setConfirming(false);
      }
      if (input === 'n') {
        setConfirming(false);
      }
      return;
    }

    if (input === 'f' && fixable.length > 0) {
      setConfirming(true);
    }
    if (input === 'u') {
      const result = applyFixes(findings, { undo: true });
      setFixResult(result);
    }
    if (input === 'r') {
      setFixResult(null);
      onRescan();
    }
  });

  if (fixable.length === 0 && !fixResult) {
    return h(
      Box,
      { padding: 1, flexDirection: 'column' },
      h(Text, { color: 'green' }, '✔ No auto-fixable issues found.'),
      h(Text, { color: 'gray' }, 'All findings require manual remediation.')
    );
  }

  const fixRows = fixable.map((finding) =>
    h(
      Box,
      { key: `${finding.rule_id}-${finding.title}` },
      h(Text, { color: 'green' }, '  ● '),
      h(Text, { color: 'white' }, `${finding.fix_type} — `),
      h(Text, { color: 'gray' }, truncate(finding.title, 60))
    )
  );

  const prompt = confirming
    ? h(
        Text,
        { bold: true, color: 'yellow' },
        `Apply ${fixable.length} fixes? Backups will be created. (y/n)`
      )
    : h(
        Text,
        { color: 'gray' },
        'Press ',
        h(Text, { bold: true, color: 'cyan' }, 'f'),
        ' to fix all · ',
        h(Text, { bold: true, color: 'cyan' }, 'u'),
        ' to undo · ',
        h(Text, { bold: true, color: 'cyan' }, 'r'),
        ' to rescan'
      );

  const resultPanel = fixResult
    ? h(
        Box,
        { flexDirection: 'column', borderStyle: 'single', borderColor: 'cyan', paddingX: 1 },
        h(Text, { bold: true, color: 'white' }, ' Results '),
        ...fixResult.fixed.map((fx) =>
          h(Text, { key: `fix-${fx.message}`, color: 'green' }, `  ✔ ${fx.message}`)
        ),
        ...fixResult.errors.map((err) =>
          h(Text, { key: `err-${err.error}`, color: 'red' }, `  ✖ ${err.error || err.reason}`)
        ),
        ...fixResult.skipped.map((sk) =>
          h(Text, { key: `skip-${sk.reason}`, color: 'gray' }, `  ○ Skipped: ${sk.reason}`)
        ),
        h(
          Text,
          { bold: true },
          `  ${fixResult.fixed.length} fixed · ${fixResult.errors.length} errors · ${fixResult.skipped.length} skipped`
        )
      )
    : null;

  return h(
    Box,
    { flexDirection: 'column' },
    h(
      Box,
      { flexDirection: 'column', borderStyle: 'single', borderColor: 'green', paddingX: 1 },
      h(Text, { bold: true, color: 'white' }, ` Auto-Fix (${fixable.length} fixable) `),
      ...fixRows,
      h(Box, { marginTop: 1 }, prompt)
    ),
    resultPanel
  );
}

function truncate(str, maxLen) {
  if (!str) {
    return '';
  }
  return str.length > maxLen ? `${str.slice(0, maxLen - 1)}…` : str;
}
