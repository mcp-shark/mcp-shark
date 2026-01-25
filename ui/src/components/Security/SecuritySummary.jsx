import { IconShieldCheck } from '@tabler/icons-react';
import { colors, fonts } from '../../theme';

const SEVERITY_CONFIG = {
  critical: { color: colors.error, label: 'Critical' },
  high: { color: '#ea580c', label: 'High' },
  medium: { color: '#b45309', label: 'Medium' },
  low: { color: '#0d9488', label: 'Low' }, // Teal
};

function StatCard({ count, label, color }) {
  const hasFindings = count > 0;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 10px',
        background: hasFindings ? `${color}10` : colors.bgTertiary,
        border: `1px solid ${hasFindings ? `${color}30` : colors.borderLight}`,
        borderRadius: '6px',
      }}
    >
      <span
        style={{
          fontSize: '14px',
          fontWeight: '600',
          color: hasFindings ? color : colors.textTertiary,
          fontFamily: fonts.body,
        }}
      >
        {count || 0}
      </span>
      <span
        style={{
          fontSize: '11px',
          color: hasFindings ? color : colors.textTertiary,
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
          padding: '8px 12px',
          background: colors.bgTertiary,
          border: `1px solid ${colors.borderLight}`,
          borderRadius: '6px',
        }}
      >
        <IconShieldCheck size={14} color={colors.textTertiary} stroke={1.5} />
        <span
          style={{
            fontSize: '12px',
            color: colors.textSecondary,
            fontFamily: fonts.body,
          }}
        >
          Run a scan to analyze MCP traffic
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
        flexWrap: 'wrap',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          background: total > 0 ? `${colors.error}10` : `${colors.accentGreen}10`,
          border: `1px solid ${total > 0 ? `${colors.error}30` : `${colors.accentGreen}30`}`,
          borderRadius: '6px',
        }}
      >
        <span
          style={{
            fontSize: '16px',
            fontWeight: '700',
            color: total > 0 ? colors.error : colors.accentGreen,
            fontFamily: fonts.body,
          }}
        >
          {total}
        </span>
        <span
          style={{
            fontSize: '12px',
            color: total > 0 ? colors.error : colors.accentGreen,
            fontFamily: fonts.body,
          }}
        >
          {total === 1 ? 'Finding' : 'Findings'}
        </span>
      </div>

      {Object.entries(SEVERITY_CONFIG).map(([severity, config]) => (
        <StatCard
          key={severity}
          count={bySeverity?.[severity] || 0}
          label={config.label}
          color={config.color}
        />
      ))}
    </div>
  );
}

export default SecuritySummary;
