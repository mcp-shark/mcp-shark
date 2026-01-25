import { IconCode, IconServer, IconTool } from '@tabler/icons-react';
import { colors } from '../../../theme.js';

export const SEVERITY_COLORS = {
  critical: colors.error,
  high: '#ea580c',
  medium: '#b45309',
  low: '#0d9488', // Teal
  info: colors.textTertiary,
};

export const TARGET_TYPE_CONFIG = {
  tool: { icon: IconTool, color: '#0d9488', label: 'Tools' }, // Teal
  prompt: { icon: IconCode, color: '#374151', label: 'Prompts' }, // Dark gray
  resource: { icon: IconServer, color: colors.accentGreen, label: 'Resources' },
  server: { icon: IconServer, color: '#57534e', label: 'Servers' }, // Stone brown
  packet: { icon: IconServer, color: colors.accentPink, label: 'Network Traffic' },
};
