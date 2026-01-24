import {
  IconAlertCircle,
  IconAlertTriangle,
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
      onSelect(finding);
    }
  };

  return (
    <tr
      onClick={() => onSelect(finding)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{
        cursor: 'pointer',
        background: isSelected ? `${colors.accent}10` : 'transparent',
        transition: 'background 0.15s ease',
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
        <IconChevronRight size={16} color={colors.textSecondary} />
      </td>
    </tr>
  );
}

function FindingDetail({ finding, onClose }) {
  if (!finding) {
    return null;
  }

  return (
    <div
      style={{
        background: colors.bgCard,
        borderRadius: '8px',
        border: `1px solid ${colors.borderLight}`,
        padding: '20px',
        marginTop: '16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <SeverityBadge severity={finding.severity} />
            <OwaspBadge owaspId={finding.owasp_id} />
          </div>
          <h3
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: colors.textPrimary,
              fontFamily: fonts.heading,
              margin: 0,
            }}
          >
            {finding.title}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: colors.textSecondary,
            cursor: 'pointer',
            fontSize: '20px',
            padding: '4px',
          }}
        >
          ×
        </button>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        <div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: colors.textSecondary,
              fontFamily: fonts.body,
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '4px',
            }}
          >
            Description
          </div>
          <p
            style={{
              fontSize: '14px',
              color: colors.textPrimary,
              fontFamily: fonts.body,
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {finding.description}
          </p>
        </div>

        {finding.evidence && (
          <div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: colors.textSecondary,
                fontFamily: fonts.body,
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '4px',
              }}
            >
              Evidence
            </div>
            <code
              style={{
                display: 'block',
                padding: '12px',
                background: colors.bgSecondary,
                borderRadius: '6px',
                fontSize: '13px',
                fontFamily: fonts.mono,
                color: colors.textPrimary,
                overflowX: 'auto',
              }}
            >
              {finding.evidence}
            </code>
          </div>
        )}

        {finding.recommendation && (
          <div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: colors.textSecondary,
                fontFamily: fonts.body,
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '4px',
              }}
            >
              Recommendation
            </div>
            <p
              style={{
                fontSize: '14px',
                color: colors.success,
                fontFamily: fonts.body,
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {finding.recommendation}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: colors.textSecondary,
                fontFamily: fonts.body,
                textTransform: 'uppercase',
              }}
            >
              Target
            </div>
            <div
              style={{
                fontSize: '14px',
                color: colors.textPrimary,
                fontFamily: fonts.body,
                marginTop: '2px',
              }}
            >
              {finding.target_type}: {finding.target_name}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: colors.textSecondary,
                fontFamily: fonts.body,
                textTransform: 'uppercase',
              }}
            >
              Server
            </div>
            <div
              style={{
                fontSize: '14px',
                color: colors.textPrimary,
                fontFamily: fonts.body,
                marginTop: '2px',
              }}
            >
              {finding.server_name || '-'}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: colors.textSecondary,
                fontFamily: fonts.body,
                textTransform: 'uppercase',
              }}
            >
              Rule ID
            </div>
            <div
              style={{
                fontSize: '14px',
                color: colors.textPrimary,
                fontFamily: fonts.mono,
                marginTop: '2px',
              }}
            >
              {finding.rule_id}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FindingsTable({ findings, selectedFinding, onSelectFinding }) {
  if (!findings || findings.length === 0) {
    return (
      <div
        style={{
          background: colors.bgCard,
          borderRadius: '12px',
          border: `1px solid ${colors.borderLight}`,
          padding: '48px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '16px',
            color: colors.textSecondary,
            fontFamily: fonts.body,
          }}
        >
          No security findings yet. Run a scan to detect vulnerabilities.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3
        style={{
          fontSize: '14px',
          fontWeight: '600',
          color: colors.textSecondary,
          fontFamily: fonts.heading,
          margin: '0 0 16px 0',
          textTransform: 'uppercase',
        }}
      >
        Findings ({findings.length})
      </h3>

      <div
        style={{
          background: colors.bgCard,
          borderRadius: '12px',
          border: `1px solid ${colors.borderLight}`,
          overflow: 'hidden',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: fonts.body,
          }}
        >
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
              <th
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  background: colors.bgSecondary,
                }}
              >
                Severity
              </th>
              <th
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  background: colors.bgSecondary,
                }}
              >
                OWASP
              </th>
              <th
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  background: colors.bgSecondary,
                }}
              >
                Finding
              </th>
              <th
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  background: colors.bgSecondary,
                }}
              >
                Server
              </th>
              <th
                style={{
                  padding: '12px 16px',
                  width: '40px',
                  background: colors.bgSecondary,
                }}
              />
            </tr>
          </thead>
          <tbody>
            {findings.map((finding) => (
              <FindingRow
                key={finding.id}
                finding={finding}
                isSelected={selectedFinding?.id === finding.id}
                onSelect={onSelectFinding}
              />
            ))}
          </tbody>
        </table>
      </div>

      <FindingDetail finding={selectedFinding} onClose={() => onSelectFinding(null)} />
    </div>
  );
}

export default FindingsTable;
