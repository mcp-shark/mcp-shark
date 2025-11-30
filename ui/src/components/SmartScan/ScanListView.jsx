import { useState } from 'react';
import { colors, fonts } from '../../theme';
import { IconRefresh, IconEye, IconExternalLink, IconChevronRight } from '@tabler/icons-react';
import { getRiskLevelColor } from './utils';

export default function ScanListView({ scans, loading, onRefresh, onSelectScan }) {
  const [expandedScan, setExpandedScan] = useState(null);

  if (loading) {
    return (
      <div
        style={{
          background: colors.bgCard,
          border: `1px solid ${colors.borderLight}`,
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <p style={{ color: colors.textSecondary, fontFamily: fonts.body }}>Loading scans...</p>
      </div>
    );
  }

  if (!scans || scans.length === 0) {
    return (
      <div
        style={{
          background: colors.bgCard,
          border: `1px solid ${colors.borderLight}`,
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <p style={{ color: colors.textSecondary, fontFamily: fonts.body }}>
          No scans found. Run a scan to see results here.
        </p>
      </div>
    );
  }

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
        <h2
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: colors.textPrimary,
            fontFamily: fonts.body,
            margin: 0,
          }}
        >
          All Scans ({scans.length})
        </h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          style={{
            padding: '6px 12px',
            background: colors.buttonSecondary,
            border: `1px solid ${colors.borderLight}`,
            color: colors.textPrimary,
            borderRadius: '6px',
            fontSize: '12px',
            fontFamily: fonts.body,
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            opacity: loading ? 0.5 : 1,
          }}
        >
          <IconRefresh size={14} stroke={1.5} />
          Refresh
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {scans.map((scan) => {
          const isExpanded = expandedScan === scan.id;
          return (
            <div
              key={scan.id}
              style={{
                background: colors.bgTertiary,
                border: `1px solid ${colors.borderLight}`,
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  cursor: 'pointer',
                }}
                onClick={() => setExpandedScan(isExpanded ? null : scan.id)}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <IconChevronRight
                    size={16}
                    stroke={1.5}
                    color={colors.textSecondary}
                    style={{
                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: colors.textPrimary,
                        fontFamily: fonts.body,
                        marginBottom: '4px',
                      }}
                    >
                      {scan.server?.name || 'Unknown Server'}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: colors.textTertiary,
                        fontFamily: fonts.body,
                      }}
                    >
                      {scan.created_at
                        ? new Date(scan.created_at).toLocaleString()
                        : 'Unknown date'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  {scan.overall_risk_level && (
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: '700',
                        fontFamily: fonts.body,
                        background: getRiskLevelColor(scan.overall_risk_level),
                        color: colors.textInverse,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {scan.overall_risk_level.toLowerCase()} risk
                    </span>
                  )}
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '10px',
                      fontWeight: '600',
                      fontFamily: fonts.body,
                      background:
                        scan.status === 'completed' ? colors.accentGreen : colors.bgSecondary,
                      color:
                        scan.status === 'completed' ? colors.textInverse : colors.textSecondary,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {scan.status || 'unknown'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectScan(scan.id);
                    }}
                    style={{
                      padding: '6px 12px',
                      background: colors.buttonPrimary,
                      border: 'none',
                      color: colors.textInverse,
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontFamily: fonts.body,
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <IconEye size={12} stroke={1.5} />
                    View
                  </button>
                  <a
                    href={`https://smart.mcpshark.sh/scan-results?id=${scan.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      padding: '6px 12px',
                      background: colors.bgSecondary,
                      border: `1px solid ${colors.borderLight}`,
                      color: colors.accentBlue,
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontFamily: fonts.body,
                      fontWeight: '500',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <IconExternalLink size={12} stroke={1.5} />
                    Open
                  </a>
                </div>
              </div>

              {isExpanded && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderTop: `1px solid ${colors.borderLight}`,
                    background: colors.bgSecondary,
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '12px',
                      fontSize: '12px',
                      fontFamily: fonts.body,
                    }}
                  >
                    <div>
                      <div style={{ color: colors.textTertiary, marginBottom: '4px' }}>Scan ID</div>
                      <div style={{ color: colors.textPrimary, fontWeight: '500' }}>{scan.id}</div>
                    </div>
                    {scan.server?.name && (
                      <div>
                        <div style={{ color: colors.textTertiary, marginBottom: '4px' }}>
                          Server
                        </div>
                        <div style={{ color: colors.textPrimary, fontWeight: '500' }}>
                          {scan.server.name}
                        </div>
                      </div>
                    )}
                    {scan.status && (
                      <div>
                        <div style={{ color: colors.textTertiary, marginBottom: '4px' }}>
                          Status
                        </div>
                        <div style={{ color: colors.textPrimary, fontWeight: '500' }}>
                          {scan.status}
                        </div>
                      </div>
                    )}
                    {scan.created_at && (
                      <div>
                        <div style={{ color: colors.textTertiary, marginBottom: '4px' }}>
                          Created
                        </div>
                        <div style={{ color: colors.textPrimary, fontWeight: '500' }}>
                          {new Date(scan.created_at).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
