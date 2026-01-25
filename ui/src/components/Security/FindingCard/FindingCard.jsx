import {
  IconBug,
  IconChevronDown,
  IconChevronRight,
  IconCode,
  IconNetwork,
} from '@tabler/icons-react';
import { useState } from 'react';
import { colors, fonts } from '../../../theme.js';
import { OwaspBadge, SeverityBadge, TargetBadge } from './Badges.jsx';
import { DetailSection, DetectedPatternsDisplay } from './DetailSection.jsx';
import { PacketDetails } from './PacketDetails.jsx';
import { SEVERITY_CONFIG, formatEvidence, parseDetectedPatterns } from './constants.js';

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
      <FindingCardHeader
        finding={finding}
        config={config}
        isExpanded={isExpanded}
        ChevronIcon={ChevronIcon}
        onToggle={handleToggle}
      />

      {isExpanded && (
        <FindingCardContent
          finding={finding}
          patterns={patterns}
          summary={summary}
          formattedEvidence={formattedEvidence}
          packet={packet}
          loadingPacket={loadingPacket}
        />
      )}
    </div>
  );
}

function FindingCardHeader({ finding, config, isExpanded, ChevronIcon, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
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
  );
}

function FindingCardContent({
  finding,
  patterns,
  summary,
  formattedEvidence,
  packet,
  loadingPacket,
}) {
  return (
    <div
      style={{
        padding: '14px 14px 14px 28px',
        borderTop: `1px solid ${colors.borderLight}`,
        background: colors.bgTertiary,
      }}
    >
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
  );
}

export default FindingCard;
