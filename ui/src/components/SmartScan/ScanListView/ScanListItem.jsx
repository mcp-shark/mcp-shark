import { useState } from 'react';
import { colors, fonts } from '../../../theme';
import { IconChevronRight, IconEye, IconExternalLink } from '@tabler/icons-react';
import { getRiskLevelColor } from '../utils';

export default function ScanListItem({ scan, onSelectScan }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
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
        onClick={() => setIsExpanded(!isExpanded)}
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
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              {scan.overall_risk_level && (
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '700',
                    fontFamily: fonts.body,
                    background: getRiskLevelColor(scan.overall_risk_level),
                    color: colors.textInverse,
                  }}
                >
                  {scan.overall_risk_level.toLowerCase()}
                </span>
              )}
              {scan.created_at && (
                <span
                  style={{
                    fontSize: '11px',
                    color: colors.textSecondary,
                    fontFamily: fonts.body,
                  }}
                >
                  {new Date(scan.created_at).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
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
                <div style={{ color: colors.textTertiary, marginBottom: '4px' }}>Server</div>
                <div style={{ color: colors.textPrimary, fontWeight: '500' }}>
                  {scan.server.name}
                </div>
              </div>
            )}
            {scan.status && (
              <div>
                <div style={{ color: colors.textTertiary, marginBottom: '4px' }}>Status</div>
                <div style={{ color: colors.textPrimary, fontWeight: '500' }}>{scan.status}</div>
              </div>
            )}
            {scan.created_at && (
              <div>
                <div style={{ color: colors.textTertiary, marginBottom: '4px' }}>Created</div>
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
}
