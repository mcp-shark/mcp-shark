import { colors, fonts } from '../../theme';

function SecurityHeader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div>
        <h2
          style={{
            fontSize: '18px',
            fontWeight: '600',
            color: colors.textPrimary,
            fontFamily: fonts.heading,
            margin: 0,
          }}
        >
          OWASP Security Scanner
        </h2>
        <p
          style={{
            fontSize: '13px',
            color: colors.textSecondary,
            fontFamily: fonts.body,
            margin: '4px 0 0 0',
          }}
        >
          Local vulnerability detection aligned with OWASP MCP Top 10
        </p>
      </div>
    </div>
  );
}

export default SecurityHeader;
