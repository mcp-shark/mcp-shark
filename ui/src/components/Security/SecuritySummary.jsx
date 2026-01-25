import {
  IconAlertCircle,
  IconAlertTriangle,
  IconInfoCircle,
  IconShieldCheck,
} from '@tabler/icons-react';
import { colors, fonts } from '../../theme';

const SEVERITY_CONFIG = {
  critical: {
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
    icon: IconAlertCircle,
    label: 'Critical',
  },
  high: {
    color: '#ea580c',
    bg: '#fff7ed',
    border: '#fed7aa',
    icon: IconAlertTriangle,
    label: 'High',
  },
  medium: {
    color: '#ca8a04',
    bg: '#fefce8',
    border: '#fef08a',
    icon: IconAlertTriangle,
    label: 'Medium',
  },
  low: {
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    icon: IconInfoCircle,
    label: 'Low',
  },
};

function SeverityCard({ count, config }) {
  const Icon = config.icon;
  const hasFindings = count > 0;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        background: hasFindings ? config.bg : colors.bgCard,
        border: `1px solid ${hasFindings ? config.border : colors.borderLight}`,
        borderRadius: '10px',
        minWidth: '120px',
        transition: 'all 0.2s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: hasFindings ? `${config.color}20` : colors.bgSecondary,
          flexShrink: 0,
        }}
      >
        <Icon size={18} color={hasFindings ? config.color : colors.textTertiary} />
      </div>
      <div>
        <div
          style={{
            fontSize: '20px',
            fontWeight: '700',
            color: hasFindings ? config.color : colors.textTertiary,
            fontFamily: fonts.body,
            lineHeight: 1,
          }}
        >
          {count || 0}
        </div>
        <div
          style={{
            fontSize: '11px',
            fontWeight: '500',
            color: hasFindings ? config.color : colors.textTertiary,
            fontFamily: fonts.body,
            textTransform: 'uppercase',
            opacity: 0.8,
          }}
        >
          {config.label}
        </div>
      </div>
    </div>
  );
}

function TotalCard({ total }) {
  const hasFindings = total > 0;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        background: hasFindings ? `${colors.error}08` : `${colors.success}08`,
        border: `1px solid ${hasFindings ? `${colors.error}30` : `${colors.success}30`}`,
        borderRadius: '10px',
        minWidth: '140px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: hasFindings ? `${colors.error}15` : `${colors.success}15`,
          flexShrink: 0,
        }}
      >
        <IconShieldCheck size={18} color={hasFindings ? colors.error : colors.success} />
      </div>
      <div>
        <div
          style={{
            fontSize: '20px',
            fontWeight: '700',
            color: hasFindings ? colors.error : colors.success,
            fontFamily: fonts.body,
            lineHeight: 1,
          }}
        >
          {total || 0}
        </div>
        <div
          style={{
            fontSize: '11px',
            fontWeight: '500',
            color: hasFindings ? colors.error : colors.success,
            fontFamily: fonts.body,
            textTransform: 'uppercase',
            opacity: 0.8,
          }}
        >
          {hasFindings ? 'Total Findings' : 'No Issues'}
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
          gap: '8px',
          padding: '12px 16px',
          background: colors.bgCard,
          border: `1px solid ${colors.borderLight}`,
          borderRadius: '10px',
        }}
      >
        <IconShieldCheck size={16} color={colors.textTertiary} />
        <span
          style={{
            fontSize: '13px',
            color: colors.textSecondary,
            fontFamily: fonts.body,
          }}
        >
          Click "Discover & Scan" to run local static analysis
        </span>
      </div>
    );
  }

  const { total, bySeverity } = summary;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: '12px',
        flexWrap: 'wrap',
      }}
    >
      <TotalCard total={total} />

      <div
        style={{
          width: '1px',
          background: colors.borderLight,
          alignSelf: 'stretch',
          margin: '0 4px',
        }}
      />

      {Object.entries(SEVERITY_CONFIG).map(([severity, config]) => (
        <SeverityCard
          key={severity}
          severity={severity}
          count={bySeverity?.[severity] || 0}
          config={config}
        />
      ))}
    </div>
  );
}

export default SecuritySummary;
