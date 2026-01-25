import { IconAlertTriangle } from '@tabler/icons-react';
import { colors, fonts } from '../../theme';

export default function ErrorDisplay({ error }) {
  if (!error) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '16px',
        background: `${colors.critical}10`,
        border: `1px solid ${colors.critical}40`,
        borderRadius: '12px',
        marginBottom: '24px',
      }}
    >
      <IconAlertTriangle size={20} color={colors.critical} style={{ flexShrink: 0 }} />
      <div>
        <h4
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: colors.critical,
            fontFamily: fonts.body,
            margin: '0 0 4px 0',
          }}
        >
          Scan Error
        </h4>
        <p
          style={{
            fontSize: '13px',
            color: colors.textSecondary,
            fontFamily: fonts.body,
            margin: 0,
            lineHeight: '1.4',
          }}
        >
          {error}
        </p>
      </div>
    </div>
  );
}
