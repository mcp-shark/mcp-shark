/**
 * TUI Header — Score display and scan summary
 */
import { Box, Text } from 'ink';
import { h } from './h.js';

const GRADE_COLORS = { A: 'green', B: 'green', C: 'yellow', D: 'yellow', F: 'red' };

export function Header({
  score,
  grade,
  serverCount,
  findingCount,
  flowCount,
  ruleCount,
  elapsedMs,
}) {
  const gradeColor = GRADE_COLORS[grade] || 'white';

  const scoreDisplay =
    score !== null
      ? h(
          '',
          null,
          h(Text, { bold: true }, 'Score: '),
          h(Text, { bold: true, color: gradeColor }, `${score}/100 (${grade})`)
        )
      : h(Text, { color: 'gray' }, 'Scanning...');

  const statsDisplay =
    score !== null
      ? h(
          Text,
          { color: 'gray' },
          `${findingCount} findings · ${flowCount} flows · ${serverCount} servers · ${ruleCount} rules · ${elapsedMs}ms`
        )
      : null;

  return h(
    Box,
    { flexDirection: 'row', paddingX: 1, justifyContent: 'space-between' },
    h(
      Box,
      null,
      h(Text, { bold: true, color: 'cyan' }, 'mcp-shark'),
      h(Text, { color: 'gray' }, ' │ '),
      scoreDisplay
    ),
    statsDisplay
  );
}
