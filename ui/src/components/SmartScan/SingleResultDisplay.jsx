import { ExternalLinkIcon } from '../SmartScanIcons';
import { colors, fonts } from '../../theme';
import { getRiskLevelColor } from './utils';

export default function SingleResultDisplay({ scanResult }) {
  if (!scanResult) return null;

  return (
    <div
      style={{
        background: colors.bgCard,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: '12px',
        padding: '24px',
        boxShadow: `0 2px 8px ${colors.shadowSm}`,
      }}
    >
      <h2
        style={{
          fontSize: '18px',
          fontWeight: '600',
          color: colors.textPrimary,
          fontFamily: fonts.body,
          marginBottom: '20px',
        }}
      >
        Scan Results
      </h2>

      {/* Overall Risk */}
      {scanResult.data?.overall_risk_level && (
        <div
          style={{
            background: colors.bgTertiary,
            border: `1px solid ${colors.borderLight}`,
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px',
            }}
          >
            <span
              style={{
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '700',
                fontFamily: fonts.body,
                background: getRiskLevelColor(scanResult.data.overall_risk_level),
                color: colors.textInverse,
              }}
            >
              {scanResult.data.overall_risk_level.toUpperCase()}
            </span>
            <span
              style={{
                fontSize: '14px',
                color: colors.textSecondary,
                fontFamily: fonts.body,
              }}
            >
              Overall Risk Level
            </span>
          </div>
          {scanResult.data.overall_reason && (
            <p
              style={{
                fontSize: '13px',
                color: colors.textSecondary,
                fontFamily: fonts.body,
                margin: 0,
              }}
            >
              {scanResult.data.overall_reason}
            </p>
          )}
        </div>
      )}

      {/* Findings Summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        {scanResult.data?.tool_findings?.length > 0 && (
          <div
            style={{
              background: colors.bgTertiary,
              border: `1px solid ${colors.borderLight}`,
              borderRadius: '8px',
              padding: '12px',
            }}
          >
            <div
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: colors.textPrimary,
                fontFamily: fonts.body,
              }}
            >
              {scanResult.data.tool_findings.length}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: colors.textSecondary,
                fontFamily: fonts.body,
              }}
            >
              Tool Findings
            </div>
          </div>
        )}
        {scanResult.data?.resource_findings?.length > 0 && (
          <div
            style={{
              background: colors.bgTertiary,
              border: `1px solid ${colors.borderLight}`,
              borderRadius: '8px',
              padding: '12px',
            }}
          >
            <div
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: colors.textPrimary,
                fontFamily: fonts.body,
              }}
            >
              {scanResult.data.resource_findings.length}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: colors.textSecondary,
                fontFamily: fonts.body,
              }}
            >
              Resource Findings
            </div>
          </div>
        )}
        {scanResult.data?.prompt_findings?.length > 0 && (
          <div
            style={{
              background: colors.bgTertiary,
              border: `1px solid ${colors.borderLight}`,
              borderRadius: '8px',
              padding: '12px',
            }}
          >
            <div
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: colors.textPrimary,
                fontFamily: fonts.body,
              }}
            >
              {scanResult.data.prompt_findings.length}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: colors.textSecondary,
                fontFamily: fonts.body,
              }}
            >
              Prompt Findings
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {scanResult.data?.recommendations?.length > 0 && (
        <div
          style={{
            background: colors.bgTertiary,
            border: `1px solid ${colors.borderLight}`,
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          <h3
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: colors.textPrimary,
              fontFamily: fonts.body,
              marginBottom: '12px',
            }}
          >
            Recommendations
          </h3>
          <ul
            style={{
              margin: 0,
              paddingLeft: '20px',
              fontSize: '13px',
              color: colors.textSecondary,
              fontFamily: fonts.body,
              lineHeight: '1.8',
            }}
          >
            {scanResult.data.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* View Full Results Link */}
      {scanResult.scan_id && (
        <div
          style={{
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: `1px solid ${colors.borderLight}`,
          }}
        >
          <a
            href={`https://smart.mcpshark.sh/scan-results?id=${scanResult.scan_id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: colors.buttonSecondary,
              color: colors.textPrimary,
              border: `1px solid ${colors.borderMedium}`,
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: '600',
              fontFamily: fonts.body,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.buttonSecondaryHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.buttonSecondary;
            }}
          >
            <span>View Full Results</span>
            <ExternalLinkIcon size={14} color={colors.textPrimary} />
          </a>
        </div>
      )}
    </div>
  );
}
