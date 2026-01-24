import {
  IconAlertCircle,
  IconAlertTriangle,
  IconInfoCircle,
  IconShieldCheck,
} from '@tabler/icons-react';
import { colors, fonts } from '../../theme';

const SEVERITY_CONFIG = {
  critical: { color: '#dc2626', bg: '#fef2f2', icon: IconAlertCircle, label: 'Critical' },
  high: { color: '#ea580c', bg: '#fff7ed', icon: IconAlertTriangle, label: 'High' },
  medium: { color: '#ca8a04', bg: '#fefce8', icon: IconAlertTriangle, label: 'Medium' },
  low: { color: '#2563eb', bg: '#eff6ff', icon: IconInfoCircle, label: 'Low' },
  info: { color: '#6b7280', bg: '#f9fafb', icon: IconInfoCircle, label: 'Info' },
};

function SeverityCard({ severity, count }) {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.info;
  const Icon = config.icon;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        background: config.bg,
        borderRadius: '8px',
        border: `1px solid ${config.color}20`,
        minWidth: '140px',
      }}
    >
      <Icon size={24} color={config.color} />
      <div>
        <div
          style={{
            fontSize: '24px',
            fontWeight: '700',
            color: config.color,
            fontFamily: fonts.heading,
            lineHeight: 1,
          }}
        >
          {count || 0}
        </div>
        <div
          style={{
            fontSize: '12px',
            color: config.color,
            fontFamily: fonts.body,
            textTransform: 'uppercase',
            fontWeight: '500',
            marginTop: '4px',
          }}
        >
          {config.label}
        </div>
      </div>
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
          gap: '12px',
          padding: '24px',
          background: colors.bgCard,
          borderRadius: '12px',
          border: `1px solid ${colors.borderLight}`,
          marginBottom: '24px',
        }}
      >
        <IconShieldCheck size={32} color={colors.success} />
        <div>
          <div
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: colors.textPrimary,
              fontFamily: fonts.heading,
            }}
          >
            No security scans yet
          </div>
          <div
            style={{
              fontSize: '13px',
              color: colors.textSecondary,
              fontFamily: fonts.body,
              marginTop: '4px',
            }}
          >
            Click "Discover & Scan" to analyze your MCP servers for OWASP vulnerabilities
          </div>
        </div>
      </div>
    );
  }

  const { total, bySeverity } = summary;

  return (
    <div style={{ marginBottom: '24px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '16px',
        }}
      >
        <h3
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: colors.textSecondary,
            fontFamily: fonts.heading,
            margin: 0,
            textTransform: 'uppercase',
          }}
        >
          Security Summary
        </h3>
        <div
          style={{
            fontSize: '13px',
            color: colors.textSecondary,
            fontFamily: fonts.body,
          }}
        >
          {total} total finding{total !== 1 ? 's' : ''}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <SeverityCard severity="critical" count={bySeverity?.critical} />
        <SeverityCard severity="high" count={bySeverity?.high} />
        <SeverityCard severity="medium" count={bySeverity?.medium} />
        <SeverityCard severity="low" count={bySeverity?.low} />
      </div>
    </div>
  );
}

export default SecuritySummary;
