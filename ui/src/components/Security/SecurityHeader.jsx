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
          background: `${colors.error}15`,
          border: `1px solid ${colors.error}30`,
          flexShrink: 0,
        }}
      >
        <IconShieldCheck size={20} color={colors.error} stroke={1.5} />
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
          Local Static Analysis
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
          Offline YARA-based scanning of captured MCP traffic
        </p>
      </div>
    </div>
  );
}

export default SecurityHeader;
