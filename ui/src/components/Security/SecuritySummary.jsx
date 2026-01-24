import { IconShieldCheck } from '@tabler/icons-react';
import { colors, fonts } from '../../theme';

const SEVERITY_CONFIG = {
  critical: { color: '#dc2626', label: 'Critical' },
  high: { color: '#ea580c', label: 'High' },
  medium: { color: '#ca8a04', label: 'Medium' },
  low: { color: '#2563eb', label: 'Low' },
};

function StatTile({ count, label, color }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        background: colors.bgCard,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: '6px',
      }}
    >
      <span
        style={{
          fontSize: '13px',
          fontWeight: '600',
          color: count > 0 ? color : colors.textTertiary,
          fontFamily: fonts.body,
        }}
      >
        {count || 0}
      </span>
      <span
        style={{
          fontSize: '11px',
          color: colors.textSecondary,
          fontFamily: fonts.body,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function SecuritySummary({ summary }) {
  if (!summary) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          background: colors.bgCard,
          border: `1px solid ${colors.borderLight}`,
          borderRadius: '6px',
          marginBottom: '16px',
        }}
      >
        <IconShieldCheck size={14} color={colors.success} />
        <span
          style={{
            fontSize: '12px',
            color: colors.textSecondary,
            fontFamily: fonts.body,
          }}
        >
          Click "Discover & Scan" to analyze MCP servers
        </span>
      </div>
    );
  }

  const { total, bySeverity } = summary;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
        flexWrap: 'wrap',
      }}
    >
      <StatTile count={total} label="findings" color={colors.textPrimary} />
      <StatTile
        count={bySeverity?.critical}
        label="critical"
        color={SEVERITY_CONFIG.critical.color}
      />
      <StatTile count={bySeverity?.high} label="high" color={SEVERITY_CONFIG.high.color} />
      <StatTile count={bySeverity?.medium} label="medium" color={SEVERITY_CONFIG.medium.color} />
      <StatTile count={bySeverity?.low} label="low" color={SEVERITY_CONFIG.low.color} />
    </div>
  );
}

export default SecuritySummary;
