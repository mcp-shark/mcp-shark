import { IconAlertTriangle, IconArrowRight } from '@tabler/icons-react';
import { colors, fonts } from '../../theme';

export default function ErrorDisplay({ error, onNavigateToSetup }) {
  if (!error) {
    return null;
  }

  // Handle both string and object error formats
  const errorMessage = typeof error === 'string' ? error : error.message || 'An error occurred';
  const requiresSetup = typeof error === 'object' && error.requiresSetup;

  // Check for setup-related errors by message content or explicit flag
  const isNoServersError =
    requiresSetup ||
    errorMessage.toLowerCase().includes('no mcp servers') ||
    errorMessage.toLowerCase().includes('no servers found') ||
    errorMessage.toLowerCase().includes('config file not found') ||
    errorMessage.toLowerCase().includes('failed to connect') ||
    errorMessage.toLowerCase().includes('servers are running') ||
    errorMessage.toLowerCase().includes('start servers via');

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
      <div style={{ flex: 1 }}>
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
          {errorMessage}
        </p>

        {isNoServersError && onNavigateToSetup && (
          <button
            type="button"
            onClick={onNavigateToSetup}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '12px',
              padding: '6px 12px',
              background: colors.accentGreen,
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 500,
              fontFamily: fonts.body,
              cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Configure MCP Servers
            <IconArrowRight size={12} stroke={2} />
          </button>
        )}
      </div>
    </div>
  );
}
