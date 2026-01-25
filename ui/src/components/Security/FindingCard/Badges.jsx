import { IconCode } from '@tabler/icons-react';
import { colors, fonts } from '../../../theme.js';
import { SEVERITY_CONFIG, TARGET_ICONS } from './constants.js';

export function SeverityBadge({ severity }) {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.info;
  const Icon = config.icon;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 6px',
        background: `${config.color}20`,
        color: config.color,
        border: `1px solid ${config.color}40`,
        borderRadius: '4px',
        fontSize: '10px',
        fontWeight: '600',
        fontFamily: fonts.body,
      }}
    >
      <Icon size={10} />
      {config.label}
    </span>
  );
}

export function OwaspBadge({ owaspId }) {
  if (!owaspId) return null;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 6px',
        background: colors.bgCard,
        color: colors.textSecondary,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: '4px',
        fontSize: '10px',
        fontWeight: '500',
        fontFamily: fonts.mono,
      }}
    >
      {owaspId}
    </span>
  );
}

export function TargetBadge({ targetType, targetName }) {
  const Icon = TARGET_ICONS[targetType] || IconCode;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '11px',
        color: colors.textSecondary,
        fontFamily: fonts.body,
      }}
    >
      <Icon size={12} stroke={1.5} />
      <span style={{ fontFamily: fonts.mono }}>{targetName}</span>
    </span>
  );
}
