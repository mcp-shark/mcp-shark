import { IconShieldCheck } from '@tabler/icons-react';
import { colors, fonts } from '../../theme';

function SecurityHeader() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginRight: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: `linear-gradient(135deg, ${colors.error}20, ${colors.warning}20)`,
          border: `2px solid ${colors.error}40`,
          flexShrink: 0,
        }}
      >
        <IconShieldCheck size={20} color={colors.error} />
      </div>
      <div>
        <h1
          style={{
            fontSize: '18px',
            fontWeight: '700',
            color: colors.textPrimary,
            fontFamily: fonts.body,
            margin: 0,
            letterSpacing: '-0.2px',
          }}
        >
          OWASP Security Scanner
        </h1>
        <p
          style={{
            fontSize: '11px',
            color: colors.textSecondary,
            fontFamily: fonts.body,
            margin: 0,
            lineHeight: '1.3',
          }}
        >
          Local vulnerability detection aligned with OWASP MCP Top 10
        </p>
      </div>
    </div>
  );
}

export default SecurityHeader;
