import {
  IconAlertCircle,
  IconAlertTriangle,
  IconChevronDown,
  IconChevronRight,
  IconInfoCircle,
} from '@tabler/icons-react';
import { colors, fonts } from '../../theme';

const SEVERITY_CONFIG = {
  critical: { color: '#dc2626', bg: '#fef2f2', icon: IconAlertCircle },
  high: { color: '#ea580c', bg: '#fff7ed', icon: IconAlertTriangle },
  medium: { color: '#ca8a04', bg: '#fefce8', icon: IconAlertTriangle },
  low: { color: '#2563eb', bg: '#eff6ff', icon: IconInfoCircle },
  info: { color: '#6b7280', bg: '#f9fafb', icon: IconInfoCircle },
};

function SeverityBadge({ severity }) {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.info;
  const Icon = config.icon;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        background: config.bg,
        color: config.color,
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500',
        fontFamily: fonts.body,
        textTransform: 'uppercase',
      }}
    >
      <Icon size={12} />
      {severity}
    </span>
  );
}

function OwaspBadge({ owaspId }) {
  if (!owaspId) {
    return null;
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 6px',
        background: `${colors.accent}15`,
        color: colors.accent,
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: '600',
        fontFamily: fonts.mono,
      }}
    >
      {owaspId}
    </span>
  );
}

function FindingRow({ finding, isSelected, onSelect }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(isSelected ? null : finding);
    }
  };

  const ChevronIcon = isSelected ? IconChevronDown : IconChevronRight;

  return (
    <tr
      onClick={() => onSelect(isSelected ? null : finding)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{
        cursor: 'pointer',
        background: isSelected ? `${colors.accent}10` : 'transparent',
        transition: 'background 0.15s ease',
        borderBottom: isSelected ? 'none' : undefined,
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
      <td style={{ padding: '12px 16px' }}>
        <SeverityBadge severity={finding.severity} />
      </td>
      <td style={{ padding: '12px 16px' }}>
        <OwaspBadge owaspId={finding.owasp_id} />
      </td>
      <td style={{ padding: '12px 16px' }}>
        <div
          style={{
            fontSize: '14px',
            fontWeight: '500',
            color: colors.textPrimary,
            fontFamily: fonts.body,
          }}
        >
          {finding.title}
        </div>
        <div
          style={{
            fontSize: '12px',
            color: colors.textSecondary,
            fontFamily: fonts.body,
            marginTop: '2px',
          }}
        >
          {finding.target_type}: {finding.target_name}
        </div>
      </td>
      <td style={{ padding: '12px 16px' }}>
        <span
          style={{
            fontSize: '13px',
            color: colors.textSecondary,
            fontFamily: fonts.body,
          }}
        >
          {finding.server_name || '-'}
        </span>
      </td>
      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
        <ChevronIcon size={16} color={colors.textSecondary} />
      </td>
    </tr>
  );
}

export default FindingRow;
