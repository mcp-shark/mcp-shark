import { IconClock, IconServer } from '@tabler/icons-react';
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

export default function HistoryItem({ scan, onSelect, isSelected }) {
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
