import { colors, fonts } from '../../theme';
import { AlertIcon } from '../SmartScanIcons';

export default function ErrorDisplay({ error }) {
  if (!error) {
    return null;
  }

  return (
    <div
      style={{
        background: colors.bgCard,
        border: `1px solid ${colors.error}`,
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
      }}
    >
      <AlertIcon size={20} color={colors.error} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontSize: '14px',
            color: colors.error,
            fontFamily: fonts.body,
            margin: 0,
            fontWeight: '600',
            marginBottom: '4px',
          }}
        >
          Error
        </p>
        <p
          style={{
            fontSize: '13px',
            color: colors.textSecondary,
            fontFamily: fonts.body,
            margin: 0,
            lineHeight: '1.5',
          }}
        >
          {error}
        </p>
      </div>
    </div>
  );
}
