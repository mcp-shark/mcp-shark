import { IconShieldCheck } from '@tabler/icons-react';
import { colors, fonts } from '../../theme';

export default function ScannerEmptyState() {
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
          border: `2px solid ${colors.borderLight}`,
          marginBottom: '24px',
        }}
      >
        <IconShieldCheck size={40} color={colors.accentBlue} stroke={1.5} />
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
        No Findings
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
        Click &quot;Discover &amp; Scan&quot; to run local static analysis on captured MCP traffic
        using YARA rules aligned with OWASP MCP Top 10.
      </p>
    </div>
  );
}
