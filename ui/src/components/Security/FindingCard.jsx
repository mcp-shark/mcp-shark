import {
  IconAlertCircle,
  IconAlertTriangle,
  IconBug,
  IconChevronDown,
  IconChevronRight,
  IconCode,
  IconInfoCircle,
  IconNetwork,
  IconServer,
  IconTool,
} from '@tabler/icons-react';
import { useState } from 'react';
import { colors, fonts } from '../../theme';

const SEVERITY_CONFIG = {
  critical: { color: colors.error, icon: IconAlertCircle, label: 'Critical' },
  high: { color: '#ea580c', icon: IconAlertTriangle, label: 'High' },
  medium: { color: '#b45309', icon: IconAlertTriangle, label: 'Medium' },
  low: { color: colors.accentBlue, icon: IconInfoCircle, label: 'Low' },
  info: { color: colors.textTertiary, icon: IconInfoCircle, label: 'Info' },
};

const TARGET_ICONS = {
  tool: IconTool,
  prompt: IconCode,
  resource: IconServer,
  server: IconServer,
  packet: IconNetwork,
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
        padding: '2px 6px',
        background: `${config.color}20`,
        color: config.color,
        border: `1px solid ${config.color}40`,
        borderRadius: '4px',
        fontSize: '10px',
        fontWeight: '600',
        fontFamily: fonts.body,
      }}
    >
      <Icon size={10} />
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
        padding: '2px 6px',
        background: colors.bgCard,
        color: colors.textSecondary,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: '4px',
        fontSize: '10px',
        fontWeight: '500',
        fontFamily: fonts.mono,
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
        fontSize: '11px',
        color: colors.textSecondary,
        fontFamily: fonts.body,
      }}
    >
      <Icon size={12} stroke={1.5} />
      <span style={{ fontFamily: fonts.mono }}>{targetName}</span>
    </span>
  );
}

function DetailSection({ label, icon: Icon, children, variant }) {
  const isHighlight = variant === 'highlight';

  return (
    <div
      style={{
        marginBottom: '12px',
        background: isHighlight ? `${colors.error}08` : 'transparent',
        border: isHighlight ? `1px solid ${colors.error}25` : 'none',
        borderRadius: isHighlight ? '6px' : 0,
        padding: isHighlight ? '10px 12px' : 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '10px',
          fontWeight: '600',
          color: isHighlight ? colors.error : colors.textTertiary,
          fontFamily: fonts.body,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '6px',
        }}
      >
        {Icon && <Icon size={12} stroke={1.5} />}
        {label}
      </div>
      {children}
    </div>
  );
}

/**
 * Parse description to extract detected patterns
 * Format: "Command-like sequences detected: pattern1, pattern2, pattern3..."
 */
function parseDetectedPatterns(description) {
  if (!description) return { summary: null, patterns: [] };

  // Try to extract patterns after common prefixes
  const prefixes = [/detected:\s*/i, /patterns?:\s*/i, /found:\s*/i, /matches?:\s*/i];

  for (const prefix of prefixes) {
    const match = description.match(prefix);
    if (match) {
      const afterPattern = description.substring(match.index + match[0].length);

      // Extract patterns - they're usually comma-separated before any JSON-like content
      // Stop at first { or [ which indicates JSON data
      const jsonStart = afterPattern.search(/[{\[]/);
      const patternsPart = jsonStart > 0 ? afterPattern.substring(0, jsonStart) : afterPattern;

      // Split by comma and clean up
      const patterns = patternsPart
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p && p.length < 100 && !p.includes('"type"')); // Filter out JSON fragments

      if (patterns.length > 0) {
        // Get the summary (text before the patterns)
        const summaryMatch = description.match(/^([^:]+):/);
        const summary = summaryMatch ? summaryMatch[1].trim() : null;

        return { summary, patterns };
      }
    }
  }

  // If no patterns found, check if description is short enough to be a summary
  if (description.length < 200 && !description.includes('{')) {
    return { summary: description, patterns: [] };
  }

  return { summary: null, patterns: [] };
}

/**
 * Format evidence - try to pretty print JSON or show as code
 */
function formatEvidence(evidence) {
  if (!evidence) return null;

  try {
    const parsed = JSON.parse(evidence);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return evidence;
  }
}

/**
 * Detected Patterns Display - Shows patterns as individual highlighted tags
 */
function DetectedPatternsDisplay({ patterns }) {
  if (!patterns || patterns.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {patterns.map((pattern, idx) => (
        <code
          key={`pattern-${idx}-${pattern.substring(0, 20)}`}
          style={{
            display: 'inline-block',
            padding: '4px 8px',
            background: colors.bgCard,
            border: `1px solid ${colors.error}30`,
            borderRadius: '4px',
            fontSize: '11px',
            fontFamily: fonts.mono,
            color: colors.error,
            fontWeight: '500',
          }}
        >
          {pattern}
        </code>
      ))}
    </div>
  );
}

function FindingCard({ finding, isExpanded, onToggle }) {
  const [packet, setPacket] = useState(null);
  const [loadingPacket, setLoadingPacket] = useState(false);

  const config = SEVERITY_CONFIG[finding.severity] || SEVERITY_CONFIG.info;
  const { summary, patterns } = parseDetectedPatterns(finding.description);
  const formattedEvidence = formatEvidence(finding.evidence);

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
        borderRadius: '8px',
        border: `1px solid ${colors.borderLight}`,
        marginBottom: '8px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isExpanded}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 14px',
          width: '100%',
          background: isExpanded ? colors.bgTertiary : 'transparent',
          border: 'none',
          borderLeft: `3px solid ${config.color}`,
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => {
          if (!isExpanded) e.currentTarget.style.background = colors.bgTertiary;
        }}
        onMouseLeave={(e) => {
          if (!isExpanded) e.currentTarget.style.background = 'transparent';
        }}
      >
        <ChevronIcon size={14} color={colors.textTertiary} style={{ flexShrink: 0 }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexWrap: 'wrap',
              marginBottom: '4px',
            }}
          >
            <span
              style={{
                fontSize: '12px',
                fontWeight: '500',
                color: colors.textPrimary,
                fontFamily: fonts.body,
              }}
            >
              {finding.title}
            </span>
            <SeverityBadge severity={finding.severity} />
            <OwaspBadge owaspId={finding.owasp_id} />
          </div>
          <TargetBadge targetType={finding.target_type} targetName={finding.target_name} />
        </div>

        {finding.server_name && (
          <span
            style={{
              fontSize: '10px',
              color: colors.textTertiary,
              fontFamily: fonts.body,
              flexShrink: 0,
            }}
          >
            {finding.server_name}
          </span>
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div
          style={{
            padding: '14px 14px 14px 28px',
            borderTop: `1px solid ${colors.borderLight}`,
            background: colors.bgTertiary,
          }}
        >
          {/* Detected Patterns - highlighted prominently */}
          {patterns.length > 0 && (
            <DetailSection label="Detected Patterns" icon={IconBug} variant="highlight">
              {summary && (
                <p
                  style={{
                    fontSize: '11px',
                    color: colors.textSecondary,
                    fontFamily: fonts.body,
                    margin: '0 0 8px 0',
                  }}
                >
                  {summary}
                </p>
              )}
              <DetectedPatternsDisplay patterns={patterns} />
            </DetailSection>
          )}

          {/* Evidence - the payload sample from the rule */}
          {formattedEvidence && (
            <DetailSection label="Payload Sample" icon={IconCode}>
              <code
                style={{
                  display: 'block',
                  padding: '8px 10px',
                  background: colors.bgCard,
                  borderRadius: '4px',
                  border: `1px solid ${colors.borderLight}`,
                  fontSize: '11px',
                  fontFamily: fonts.mono,
                  color: colors.textPrimary,
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  lineHeight: 1.5,
                  maxHeight: '150px',
                }}
              >
                {formattedEvidence}
              </code>
            </DetailSection>
          )}

          {/* Packet details - the full traffic content */}
          {finding.frame_number && (
            <DetailSection
              label={`Traffic Content (Packet #${finding.frame_number})`}
              icon={IconNetwork}
            >
              {loadingPacket && (
                <div style={{ fontSize: '11px', color: colors.textTertiary }}>Loading...</div>
              )}
              {packet && <PacketDetails packet={packet} />}
              {!loadingPacket && !packet && (
                <div style={{ fontSize: '11px', color: colors.textTertiary }}>
                  Click to load packet content
                </div>
              )}
            </DetailSection>
          )}

          {/* Recommendation */}
          {finding.recommendation && (
            <DetailSection label="Recommendation">
              <div
                style={{
                  padding: '8px 10px',
                  background: `${colors.accentGreen}10`,
                  borderRadius: '6px',
                  border: `1px solid ${colors.accentGreen}30`,
                }}
              >
                <p
                  style={{
                    fontSize: '12px',
                    color: colors.accentGreen,
                    fontFamily: fonts.body,
                    margin: 0,
                    lineHeight: 1.5,
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
              gap: '12px',
              flexWrap: 'wrap',
              fontSize: '10px',
              color: colors.textTertiary,
              paddingTop: '10px',
              borderTop: `1px solid ${colors.borderLight}`,
            }}
          >
            <span>
              Rule: <span style={{ fontFamily: fonts.mono }}>{finding.rule_id}</span>
            </span>
            {finding.session_id && (
              <span>
                Session: <span style={{ fontFamily: fonts.mono }}>{finding.session_id}</span>
              </span>
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
        borderRadius: '6px',
        border: `1px solid ${colors.borderLight}`,
        overflow: 'hidden',
      }}
    >
      {headers && Object.keys(headers).length > 0 && (
        <div style={{ padding: '8px 10px', borderBottom: `1px solid ${colors.borderLight}` }}>
          <div
            style={{
              fontSize: '9px',
              fontWeight: '600',
              color: colors.textTertiary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '4px',
            }}
          >
            Headers
          </div>
          <div style={{ fontSize: '10px', fontFamily: fonts.mono }}>
            {Object.entries(headers).map(([key, value]) => (
              <div key={key} style={{ marginBottom: '2px' }}>
                <span style={{ color: colors.accentBlue }}>{key}:</span>{' '}
                <span style={{ color: colors.textPrimary }}>{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {body && (
        <div style={{ padding: '8px 10px' }}>
          <div
            style={{
              fontSize: '9px',
              fontWeight: '600',
              color: colors.textTertiary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '4px',
            }}
          >
            Body
          </div>
          <pre
            style={{
              fontSize: '10px',
              fontFamily: fonts.mono,
              color: colors.textPrimary,
              margin: 0,
              overflow: 'auto',
              maxHeight: '200px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              background: colors.bgTertiary,
              padding: '8px',
              borderRadius: '4px',
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
