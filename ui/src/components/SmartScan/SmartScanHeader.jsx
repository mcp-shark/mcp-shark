import { colors, fonts } from '../../theme';
import { ExternalLinkIcon, ShieldIcon } from '../SmartScanIcons';

export default function SmartScanHeader() {
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
          background: `linear-gradient(135deg, ${colors.accentBlue}20, ${colors.accentGreen}20)`,
          border: `2px solid ${colors.accentBlue}40`,
          flexShrink: 0,
        }}
      >
        <ShieldIcon size={20} color={colors.accentBlue} />
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
          <a
            href="https://smart.mcpshark.sh/#get-started"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: colors.textPrimary,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.accentBlue;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.textPrimary;
            }}
          >
            Smart Scan
            <ExternalLinkIcon size={12} color="currentColor" />
          </a>
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
          AI-powered security analysis for Model Context Protocol (MCP) servers
        </p>
      </div>
    </div>
  );
}
