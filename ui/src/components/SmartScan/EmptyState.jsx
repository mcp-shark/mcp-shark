import { colors, fonts } from '../../theme';

export default function EmptyState() {
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
        >
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
        Ready to Scan
      </h3>
      <p
        style={{
          fontSize: '14px',
          color: colors.textSecondary,
          fontFamily: fonts.body,
          maxWidth: '400px',
          lineHeight: '1.6',
        }}
      >
        Configure your API token and discover MCP servers to start security scanning. Results will
        appear here.
      </p>
    </div>
  );
}
