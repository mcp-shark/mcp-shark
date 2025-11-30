import { CheckIcon, CacheIcon, ExternalLinkIcon } from '../../SmartScanIcons';
import { IconEye } from '@tabler/icons-react';
import { colors, fonts } from '../../../theme';
import { getRiskLevelColor } from '../utils';

export default function BatchResultItem({ result, onViewScan }) {
  // Ensure we have a valid server name
  const serverName =
    result.serverName || result.server_name || result.server?.name || 'Unknown Server';

  console.log('[BatchResultItem] Rendering with result:', {
    serverName: result.serverName,
    extractedServerName: serverName,
    hasServerName: !!result.serverName,
    resultKeys: Object.keys(result),
  });

  return (
    <div
      style={{
        background: colors.bgTertiary,
        border: `1px solid ${result.success ? colors.borderLight : colors.error}`,
        borderRadius: '8px',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
        <h3
          style={{
            fontSize: '13px',
            fontWeight: '600',
            color: colors.textPrimary,
            fontFamily: fonts.body,
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {serverName}
        </h3>

        {result.success && (
          <>
            {result.data?.data?.overall_risk_level && (
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: '700',
                  fontFamily: fonts.body,
                  background: getRiskLevelColor(result.data.data.overall_risk_level),
                  color: colors.textInverse,
                  whiteSpace: 'nowrap',
                }}
              >
                {result.data.data.overall_risk_level.toLowerCase()} risk
              </span>
            )}
            {onViewScan && result.data && (
              <button
                onClick={() => onViewScan(result.data)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: colors.buttonPrimary,
                  border: 'none',
                  color: colors.textInverse,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '11px',
                  fontWeight: '500',
                  fontFamily: fonts.body,
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.buttonPrimaryHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.buttonPrimary;
                }}
              >
                <IconEye size={12} stroke={1.5} />
                <span>View</span>
              </button>
            )}
            {result.data?.scan_id && (
              <a
                href={`https://smart.mcpshark.sh/scan-results?id=${result.data.scan_id}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: colors.bgSecondary,
                  border: `1px solid ${colors.borderLight}`,
                  color: colors.accentBlue,
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '11px',
                  fontWeight: '500',
                  fontFamily: fonts.body,
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.bgTertiary;
                  e.currentTarget.style.borderColor = colors.accentBlue;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.bgSecondary;
                  e.currentTarget.style.borderColor = colors.borderLight;
                }}
              >
                <span>open</span>
                <ExternalLinkIcon size={12} color={colors.accentBlue} />
              </a>
            )}
          </>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {result.success ? (
          <>
            {result.cached && (
              <span
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: '600',
                  fontFamily: fonts.body,
                  background: colors.bgSecondary,
                  color: colors.textSecondary,
                  border: `1px solid ${colors.borderLight}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap',
                }}
                title="This result was retrieved from cache"
              >
                <CacheIcon size={10} color={colors.textSecondary} />
                <span>Cached</span>
              </span>
            )}
            <span
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: '700',
                fontFamily: fonts.body,
                background: colors.accentGreen,
                color: colors.textInverse,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
              }}
            >
              <CheckIcon size={10} color={colors.textInverse} />
              <span>Success</span>
            </span>
          </>
        ) : (
          <>
            <span
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: '700',
                fontFamily: fonts.body,
                background: colors.error,
                color: colors.textInverse,
                whiteSpace: 'nowrap',
              }}
            >
              ✗ Failed
            </span>
            {result.error && (
              <span
                style={{
                  fontSize: '11px',
                  color: colors.error,
                  fontFamily: fonts.body,
                  whiteSpace: 'nowrap',
                  maxWidth: '200px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={result.error}
              >
                {result.error}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
