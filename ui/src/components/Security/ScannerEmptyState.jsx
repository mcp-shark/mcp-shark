import { IconArrowRight, IconSettings } from '@tabler/icons-react';
import { colors, fonts } from '../../theme';

export default function ScannerEmptyState({ onNavigateToSetup, serversAvailable }) {
  // Different messaging based on whether servers are running
  const title = serversAvailable ? 'No Findings' : 'No MCP Servers Running';
  const description = serversAvailable
    ? 'Click "Analyse" to run local static analysis on your connected MCP servers.'
    : 'Start MCP servers via the Setup tab to enable analysis.';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        textAlign: 'center',
        padding: '40px',
      }}
    >
      <div style={{ marginBottom: '24px', opacity: 0.6 }}>
        <svg
          width={64}
          height={64}
          viewBox="0 0 24 24"
          fill="none"
          stroke={colors.textTertiary}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0.5 }}
          role="img"
          aria-label="Security scan icon"
        >
          <title>Security scan icon</title>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      </div>
      <h3
        style={{
          fontSize: '20px',
          fontWeight: '600',
          color: colors.textPrimary,
          fontFamily: fonts.body,
          marginBottom: '8px',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '14px',
          color: colors.textSecondary,
          fontFamily: fonts.body,
          maxWidth: '400px',
          lineHeight: '1.6',
          marginBottom: '24px',
        }}
      >
        {description}
      </p>

      {!serversAvailable && (
        <button
          type="button"
          onClick={onNavigateToSetup}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 20px',
            background: colors.accentGreen,
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 500,
            fontFamily: fonts.body,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          <IconSettings size={16} stroke={1.5} />
          Go to Setup
          <IconArrowRight size={14} stroke={2} />
        </button>
      )}

      {serversAvailable && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            background: colors.bgSecondary,
            border: `1px solid ${colors.borderLight}`,
            borderRadius: '8px',
          }}
        >
          <IconSettings size={16} stroke={1.5} style={{ color: colors.textMuted }} />
          <span
            style={{
              fontSize: '13px',
              color: colors.textSecondary,
              fontFamily: fonts.body,
            }}
          >
            Configure different servers?
          </span>
          <button
            type="button"
            onClick={onNavigateToSetup}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              background: 'transparent',
              color: colors.accentGreen,
              border: `1px solid ${colors.accentGreen}`,
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 500,
              fontFamily: fonts.body,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.accentGreen;
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = colors.accentGreen;
            }}
          >
            Go to Setup
            <IconArrowRight size={12} stroke={2} />
          </button>
        </div>
      )}
    </div>
  );
}
