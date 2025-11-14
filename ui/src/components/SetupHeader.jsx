import { colors, fonts } from '../theme';

export default function SetupHeader() {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h2
        style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '8px',
          color: colors.textPrimary,
          fontFamily: fonts.body,
        }}
      >
        MCP Shark Server Setup
      </h2>
      <p
        style={{
          fontSize: '14px',
          color: colors.textSecondary,
          lineHeight: '1.6',
          fontFamily: fonts.body,
        }}
      >
        Convert your MCP configuration file and start the MCP Shark server to aggregate multiple MCP
        servers into a single endpoint.
      </p>
    </div>
  );
}
