import { IconCode, IconServer, IconTool } from '@tabler/icons-react';
import { colors } from '../../../theme.js';

export const SEVERITY_COLORS = {
  critical: colors.error,
  high: '#ea580c',
  medium: '#b45309',
  low: colors.accentBlue,
  info: colors.textTertiary,
};

export const TARGET_TYPE_CONFIG = {
  tool: { icon: IconTool, color: colors.accentPurple, label: 'Tools' },
  prompt: { icon: IconCode, color: colors.accentBlue, label: 'Prompts' },
  resource: { icon: IconServer, color: colors.accentGreen, label: 'Resources' },
  server: { icon: IconServer, color: colors.accentOrange, label: 'Servers' },
  packet: { icon: IconServer, color: colors.accentPink, label: 'Network Traffic' },
};
