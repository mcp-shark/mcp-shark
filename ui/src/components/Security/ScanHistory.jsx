import { IconChevronDown, IconChevronRight, IconClock, IconServer } from '@tabler/icons-react';
import { useCallback, useState } from 'react';
import { colors, fonts } from '../../theme';

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  // Less than 1 minute
  if (diff < 60000) {
    return 'Just now';
  }
  // Less than 1 hour
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `${mins} min${mins > 1 ? 's' : ''} ago`;
  }
  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  // More than 24 hours - show date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function SeverityBadge({ count, severity, color }) {
  if (!count) {
    return null;
  }
  return (
    <span
      style={{
        padding: '2px 6px',
        background: `${color}15`,
        color: color,
        borderRadius: '4px',
        fontSize: '10px',
        fontWeight: 600,
        fontFamily: fonts.mono,
      }}
    >
      {count} {severity}
    </span>
  );
}

function HistoryItem({ scan, onSelect, isSelected }) {
  const servers = scan.servers ? scan.servers.split(',') : [];

  return (
    <button
      type="button"
      onClick={() => onSelect(scan.scan_id)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        width: '100%',
        padding: '12px',
        background: isSelected ? `${colors.accentGreen}10` : 'transparent',
        border: `1px solid ${isSelected ? colors.accentGreen : colors.borderLight}`,
        borderRadius: '6px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = colors.bgSecondary;
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '6px',
          }}
        >
          <IconClock size={12} stroke={1.5} style={{ color: colors.textMuted }} />
          <span
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: colors.textPrimary,
              fontFamily: fonts.body,
            }}
          >
            {formatDate(scan.scan_time)}
          </span>
          <span
            style={{
              fontSize: '11px',
              color: colors.textMuted,
              fontFamily: fonts.mono,
            }}
          >
            {scan.finding_count} finding{scan.finding_count !== 1 ? 's' : ''}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <IconServer size={11} stroke={1.5} style={{ color: colors.textMuted }} />
          <span
            style={{
              fontSize: '11px',
              color: colors.textSecondary,
              fontFamily: fonts.body,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {servers.join(', ')}
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          <SeverityBadge
            count={scan.critical_count}
            severity="critical"
            color={colors.severityCritical}
          />
          <SeverityBadge count={scan.high_count} severity="high" color={colors.severityHigh} />
          <SeverityBadge
            count={scan.medium_count}
            severity="medium"
            color={colors.severityMedium}
          />
          <SeverityBadge count={scan.low_count} severity="low" color={colors.severityLow} />
        </div>
      </div>
    </button>
  );
}

export default function ScanHistory({ history, onSelectScan, selectedScanId }) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  if (!history || history.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        marginBottom: '16px',
        border: `1px solid ${colors.borderLight}`,
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={toggleExpanded}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '12px 16px',
          background: colors.bgSecondary,
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {expanded ? (
            <IconChevronDown size={16} stroke={2} style={{ color: colors.textMuted }} />
          ) : (
            <IconChevronRight size={16} stroke={2} style={{ color: colors.textMuted }} />
          )}
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: colors.textPrimary,
              fontFamily: fonts.body,
            }}
          >
            Scan History
          </span>
          <span
            style={{
              fontSize: '11px',
              color: colors.textMuted,
              fontFamily: fonts.mono,
              background: colors.bgPrimary,
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            {history.length}
          </span>
        </div>
      </button>

      {expanded && (
        <div
          style={{
            padding: '12px',
            background: colors.bgPrimary,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '300px',
            overflowY: 'auto',
          }}
        >
          {history.map((scan) => (
            <HistoryItem
              key={scan.scan_id}
              scan={scan}
              onSelect={onSelectScan}
              isSelected={selectedScanId === scan.scan_id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
