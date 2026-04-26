import { IconKey, IconKeyOff, IconLockOpen, IconShieldCheck } from '@tabler/icons-react';
import { colors, fonts } from '../theme';

const POSTURES = {
  signed: {
    label: 'Signed',
    color: colors.success,
    bg: 'rgba(56, 161, 105, 0.10)',
    border: 'rgba(56, 161, 105, 0.35)',
    Icon: IconShieldCheck,
    description:
      'AAuth identity headers and an HTTP Message Signature were observed. mcp-shark does not verify signatures.',
  },
  'aauth-aware': {
    label: 'AAuth-aware',
    color: colors.accentBlue,
    bg: 'rgba(45, 55, 72, 0.08)',
    border: 'rgba(45, 55, 72, 0.30)',
    Icon: IconKey,
    description: 'AAuth headers were observed but no full HTTP Message Signature was present.',
  },
  bearer: {
    label: 'Bearer',
    color: colors.warning,
    bg: 'rgba(214, 158, 46, 0.12)',
    border: 'rgba(214, 158, 46, 0.40)',
    Icon: IconKeyOff,
    description:
      'A Bearer token was observed in the Authorization header. No AAuth identity present.',
  },
  none: {
    label: 'No auth',
    color: colors.textTertiary,
    bg: 'rgba(128, 134, 139, 0.10)',
    border: 'rgba(128, 134, 139, 0.30)',
    Icon: IconLockOpen,
    description: 'No AAuth identity or Bearer credential was observed.',
  },
};

function buildTitle(aauth, descriptor) {
  const parts = [descriptor.description];
  if (aauth?.agent) {
    parts.push(`Agent: ${aauth.agent}`);
  }
  if (aauth?.sig_alg) {
    parts.push(`Algorithm: ${aauth.sig_alg}`);
  }
  if (aauth?.mission) {
    parts.push(`Mission: ${aauth.mission}`);
  }
  return parts.join('\n');
}

/**
 * Compact, posture-coloured chip used in tables and detail panels.
 * Always describes signals as observed; never claims cryptographic verification.
 */
export default function AAuthBadge({ aauth, size = 'md', showLabel = true }) {
  const posture = aauth?.posture || 'none';
  const descriptor = POSTURES[posture] || POSTURES.none;
  const Icon = descriptor.Icon;

  const dimensions =
    size === 'sm'
      ? { padding: '2px 6px', fontSize: '10px', iconSize: 11 }
      : { padding: '3px 8px', fontSize: '11px', iconSize: 13 };

  return (
    <span
      title={buildTitle(aauth, descriptor)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: dimensions.padding,
        background: descriptor.bg,
        border: `1px solid ${descriptor.border}`,
        borderRadius: '999px',
        color: descriptor.color,
        fontSize: dimensions.fontSize,
        fontFamily: fonts.body,
        fontWeight: 500,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
      }}
    >
      <Icon size={dimensions.iconSize} stroke={1.6} />
      {showLabel && <span>{descriptor.label}</span>}
    </span>
  );
}
