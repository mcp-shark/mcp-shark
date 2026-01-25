import { IconLoader2 } from '@tabler/icons-react';
import { colors, fonts } from '../../theme';

export default function ScanningProgress({ scanning }) {
  if (!scanning) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '80px',
          height: '80px',
          borderRadius: '20px',
          background: `linear-gradient(135deg, ${colors.accentBlue}15, ${colors.accentGreen}15)`,
          border: `2px solid ${colors.accentBlue}40`,
          marginBottom: '24px',
        }}
      >
        <IconLoader2
          size={40}
          color={colors.accentBlue}
          stroke={1.5}
          style={{ animation: 'spin 1s linear infinite' }}
        />
      </div>
      <h3
        style={{
          fontSize: '18px',
          fontWeight: '600',
          color: colors.textPrimary,
          fontFamily: fonts.body,
          margin: '0 0 8px 0',
        }}
      >
        Running Local Analysis...
      </h3>
      <p
        style={{
          fontSize: '14px',
          color: colors.textSecondary,
          fontFamily: fonts.body,
          margin: 0,
          maxWidth: '400px',
          lineHeight: '1.5',
        }}
      >
        Scanning captured MCP traffic with YARA rules.
      </p>
    </div>
  );
}
