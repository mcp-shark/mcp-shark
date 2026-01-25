import {
  IconAlertCircle,
  IconAlertTriangle,
  IconChevronDown,
  IconChevronRight,
  IconCode,
  IconInfoCircle,
  IconServer,
  IconShieldCheck,
  IconTool,
} from '@tabler/icons-react';
import { useState } from 'react';
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
  info: {
    color: '#6b7280',
    bg: '#f9fafb',
    border: '#e5e7eb',
    icon: IconInfoCircle,
    label: 'Info',
  },
};

const TARGET_ICONS = {
  tool: IconTool,
  prompt: IconCode,
  resource: IconServer,
  server: IconServer,
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
        padding: '4px 10px',
        background: config.bg,
        color: config.color,
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: '600',
        fontFamily: fonts.body,
        textTransform: 'uppercase',
        border: `1px solid ${config.border}`,
      }}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
}

function OwaspBadge({ owaspId }) {
  if (!owaspId) return null;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 8px',
        background: `${colors.accent}15`,
        color: colors.accent,
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: '600',
        fontFamily: fonts.mono,
        border: `1px solid ${colors.accent}30`,
      }}
    >
      {owaspId}
    </span>
  );
}

function TargetBadge({ targetType, targetName }) {
  const Icon = TARGET_ICONS[targetType] || IconCode;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        background: colors.bgSecondary,
        color: colors.textSecondary,
        borderRadius: '6px',
        fontSize: '11px',
        fontFamily: fonts.body,
        border: `1px solid ${colors.borderLight}`,
      }}
    >
      <Icon size={12} />
      <span style={{ fontWeight: '500' }}>{targetType}:</span>
      <span style={{ fontFamily: fonts.mono }}>{targetName}</span>
    </span>
  );
}

function DetailSection({ label, children, icon: Icon }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '11px',
          fontWeight: '600',
          color: colors.textSecondary,
          fontFamily: fonts.body,
          textTransform: 'uppercase',
          marginBottom: '8px',
          letterSpacing: '0.05em',
        }}
      >
        {Icon && <Icon size={12} />}
        {label}
      </div>
      {children}
    </div>
  );
}

function FindingCard({ finding, isExpanded, onToggle }) {
  const [packet, setPacket] = useState(null);
  const [loadingPacket, setLoadingPacket] = useState(false);

  const config = SEVERITY_CONFIG[finding.severity] || SEVERITY_CONFIG.info;

  const handleToggle = () => {
    if (!isExpanded && finding.frame_number && !packet) {
      setLoadingPacket(true);
      fetch(`/api/packets/${finding.frame_number}`)
        .then((res) => res.json())
        .then((data) => {
          setPacket(data);
          setLoadingPacket(false);
        })
        .catch(() => setLoadingPacket(false));
    }
    onToggle();
  };

  const ChevronIcon = isExpanded ? IconChevronDown : IconChevronRight;

  return (
    <div
      style={{
        background: colors.bgCard,
        borderRadius: '12px',
        border: `1px solid ${colors.borderLight}`,
        overflow: 'hidden',
        marginBottom: '12px',
        transition: 'all 0.2s ease',
        boxShadow: isExpanded ? `0 4px 12px ${colors.shadowSm}` : 'none',
      }}
    >
      {/* Header - Always visible */}
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isExpanded}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
          padding: '16px 20px',
          cursor: 'pointer',
          borderLeft: `4px solid ${config.color}`,
          background: isExpanded ? `${config.color}08` : 'transparent',
          transition: 'background 0.15s ease',
          width: '100%',
          border: 'none',
          borderLeftWidth: '4px',
          borderLeftStyle: 'solid',
          borderLeftColor: config.color,
          textAlign: 'left',
        }}
        onMouseEnter={(e) => {
          if (!isExpanded) e.currentTarget.style.background = colors.bgSecondary;
        }}
        onMouseLeave={(e) => {
          if (!isExpanded) e.currentTarget.style.background = 'transparent';
        }}
      >
        {/* Severity indicator */}
        <div style={{ flexShrink: 0, paddingTop: '2px' }}>
          <config.icon size={20} color={config.color} />
        </div>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap',
              marginBottom: '8px',
            }}
          >
            <h4
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: colors.textPrimary,
                fontFamily: fonts.body,
                margin: 0,
              }}
            >
              {finding.title}
            </h4>
            <SeverityBadge severity={finding.severity} />
            <OwaspBadge owaspId={finding.owasp_id} />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <TargetBadge targetType={finding.target_type} targetName={finding.target_name} />
            {finding.server_name && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  color: colors.textSecondary,
                  fontFamily: fonts.body,
                }}
              >
                <IconServer size={12} />
                {finding.server_name}
              </span>
            )}
          </div>
        </div>

        {/* Expand icon */}
        <div style={{ flexShrink: 0, paddingTop: '2px' }}>
          <ChevronIcon size={18} color={colors.textSecondary} />
        </div>
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div
          style={{
            padding: '20px 24px',
            paddingLeft: '60px',
            borderTop: `1px solid ${colors.borderLight}`,
            background: colors.bgSecondary,
          }}
        >
          {/* Description */}
          <DetailSection label="Description">
            <p
              style={{
                fontSize: '13px',
                color: colors.textPrimary,
                fontFamily: fonts.body,
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              {finding.description}
            </p>
          </DetailSection>

          {/* Evidence */}
          {finding.evidence && (
            <DetailSection label="Evidence" icon={IconCode}>
              <code
                style={{
                  display: 'block',
                  padding: '12px 16px',
                  background: colors.bgCard,
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontFamily: fonts.mono,
                  color: colors.textPrimary,
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  border: `1px solid ${colors.borderLight}`,
                }}
              >
                {finding.evidence}
              </code>
            </DetailSection>
          )}

          {/* Packet Details */}
          {finding.frame_number && (
            <DetailSection label={`Captured Packet (Frame #${finding.frame_number})`}>
              {loadingPacket && (
                <div
                  style={{
                    fontSize: '12px',
                    color: colors.textSecondary,
                    padding: '12px',
                    background: colors.bgCard,
                    borderRadius: '8px',
                    border: `1px solid ${colors.borderLight}`,
                  }}
                >
                  Loading packet data...
                </div>
              )}
              {packet && <PacketDetails packet={packet} />}
              {!loadingPacket && !packet && (
                <div
                  style={{
                    fontSize: '12px',
                    color: colors.textSecondary,
                    padding: '12px',
                    background: colors.bgCard,
                    borderRadius: '8px',
                    border: `1px solid ${colors.borderLight}`,
                  }}
                >
                  Packet data not available
                </div>
              )}
            </DetailSection>
          )}

          {/* Recommendation */}
          {finding.recommendation && (
            <DetailSection label="Recommendation" icon={IconShieldCheck}>
              <div
                style={{
                  padding: '12px 16px',
                  background: `${colors.success}10`,
                  borderRadius: '8px',
                  border: `1px solid ${colors.success}30`,
                }}
              >
                <p
                  style={{
                    fontSize: '13px',
                    color: colors.success,
                    fontFamily: fonts.body,
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {finding.recommendation}
                </p>
              </div>
            </DetailSection>
          )}

          {/* Metadata */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              fontSize: '11px',
              paddingTop: '8px',
              borderTop: `1px solid ${colors.borderLight}`,
            }}
          >
            <div>
              <span style={{ color: colors.textTertiary }}>Rule ID: </span>
              <span style={{ fontFamily: fonts.mono, color: colors.textSecondary }}>
                {finding.rule_id}
              </span>
            </div>
            {finding.session_id && (
              <div>
                <span style={{ color: colors.textTertiary }}>Session: </span>
                <span style={{ fontFamily: fonts.mono, color: colors.textSecondary }}>
                  {finding.session_id}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PacketDetails({ packet }) {
  const headers = packet.headers_json ? JSON.parse(packet.headers_json) : null;
  const body = packet.body_json ? JSON.parse(packet.body_json) : packet.body_raw;

  return (
    <div
      style={{
        background: colors.bgCard,
        borderRadius: '8px',
        border: `1px solid ${colors.borderLight}`,
        overflow: 'hidden',
      }}
    >
      {headers && Object.keys(headers).length > 0 && (
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${colors.borderLight}` }}>
          <div
            style={{
              fontSize: '10px',
              fontWeight: '600',
              color: colors.textTertiary,
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            Headers
          </div>
          <div style={{ fontSize: '12px', fontFamily: fonts.mono }}>
            {Object.entries(headers).map(([key, value]) => (
              <div key={key} style={{ marginBottom: '4px' }}>
                <span style={{ color: colors.accentBlue }}>{key}:</span>{' '}
                <span style={{ color: colors.textPrimary }}>{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {body && (
        <div style={{ padding: '12px 16px' }}>
          <div
            style={{
              fontSize: '10px',
              fontWeight: '600',
              color: colors.textTertiary,
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            Body
          </div>
          <pre
            style={{
              fontSize: '12px',
              fontFamily: fonts.mono,
              color: colors.textPrimary,
              margin: 0,
              overflow: 'auto',
              maxHeight: '200px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {typeof body === 'object' ? JSON.stringify(body, null, 2) : body}
          </pre>
        </div>
      )}
    </div>
  );
}

export default FindingCard;
