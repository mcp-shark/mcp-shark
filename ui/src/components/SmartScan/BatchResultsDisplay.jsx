import { CheckIcon, CacheIcon, ExternalLinkIcon } from '../SmartScanIcons';
import { IconEye } from '@tabler/icons-react';
import { colors, fonts } from '../../theme';
import { getRiskLevelColor } from './utils';

export default function BatchResultsDisplay({ scanResults, onViewScan }) {
  if (scanResults.length === 0) return null;

  return (
    <div
      style={{
        background: colors.bgCard,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: '8px',
        padding: '20px',
        boxShadow: `0 1px 3px ${colors.shadowSm}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: colors.textPrimary,
              fontFamily: fonts.body,
              margin: 0,
              marginBottom: '4px',
            }}
          >
            Scan Results ({scanResults.length} server{scanResults.length !== 1 ? 's' : ''})
          </h2>
          {scanResults.every((r) => r.cached) && (
            <p
              style={{
                fontSize: '12px',
                color: colors.textTertiary,
                fontFamily: fonts.body,
                margin: 0,
              }}
            >
              Showing cached results. Run a new scan to get the latest analysis.
            </p>
          )}
        </div>
        {scanResults.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              fontSize: '13px',
              color: colors.textSecondary,
              fontFamily: fonts.body,
            }}
          >
            {scanResults.filter((r) => r.cached).length > 0 && (
              <span
                style={{
                  padding: '6px 10px',
                  background: colors.bgTertiary,
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontFamily: fonts.body,
                }}
              >
                <CacheIcon size={12} color={colors.textSecondary} />
                <span>{scanResults.filter((r) => r.cached).length} cached</span>
              </span>
            )}
            {scanResults.filter((r) => r.success && !r.cached).length > 0 && (
              <span
                style={{
                  padding: '6px 10px',
                  background: colors.bgTertiary,
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <CheckIcon size={12} color={colors.accentGreen} />
                <span>{scanResults.filter((r) => r.success && !r.cached).length} scanned</span>
              </span>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {scanResults.map((result, idx) => (
          <div
            key={idx}
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
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}
            >
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
                {result.serverName}
              </h3>

              {result.success && result.data?.data?.overall_risk_level && (
                <>
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
                  {result.data?.scan_id && (
                    <>
                      {onViewScan && (
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
                        <span>Open</span>
                        <ExternalLinkIcon size={12} color={colors.accentBlue} />
                      </a>
                    </>
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
        ))}
      </div>
    </div>
  );
}
