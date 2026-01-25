import {
  IconChevronDown,
  IconChevronRight,
  IconCode,
  IconServer,
  IconTool,
} from '@tabler/icons-react';
import { useState } from 'react';
import { colors, fonts } from '../../theme';
import FindingCard from './FindingCard.jsx';

const SEVERITY_COLORS = {
  critical: colors.error,
  high: '#ea580c',
  medium: '#b45309',
  low: colors.accentBlue,
  info: colors.textTertiary,
};

const TARGET_TYPE_CONFIG = {
  tool: { icon: IconTool, color: colors.accentPurple, label: 'Tools' },
  prompt: { icon: IconCode, color: colors.accentBlue, label: 'Prompts' },
  resource: { icon: IconServer, color: colors.accentGreen, label: 'Resources' },
  server: { icon: IconServer, color: colors.accentOrange, label: 'Servers' },
  packet: { icon: IconServer, color: colors.accentPink, label: 'Network Traffic' },
};

function TargetGroup({ targetName, targetType, findings, selectedFinding, onSelectFinding }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const typeConfig = TARGET_TYPE_CONFIG[targetType] || TARGET_TYPE_CONFIG.tool;
  const Icon = typeConfig.icon;

  const severityCounts = findings.reduce((acc, f) => {
    acc[f.severity || 'info'] = (acc[f.severity || 'info'] || 0) + 1;
    return acc;
  }, {});

  const severities = ['critical', 'high', 'medium', 'low', 'info'];
  const highestSeverity = severities.find((s) => severityCounts[s] > 0) || 'info';

  return (
    <div
      style={{
        marginBottom: '6px',
        background: colors.bgCard,
        borderRadius: '6px',
        border: `1px solid ${colors.borderLight}`,
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          width: '100%',
          background: 'transparent',
          border: 'none',
          borderLeft: `3px solid ${SEVERITY_COLORS[highestSeverity]}`,
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.bgTertiary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        {isExpanded ? (
          <IconChevronDown size={12} color={colors.textTertiary} />
        ) : (
          <IconChevronRight size={12} color={colors.textTertiary} />
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '20px',
            height: '20px',
            borderRadius: '4px',
            background: `${typeConfig.color}15`,
          }}
        >
          <Icon size={10} color={typeConfig.color} stroke={1.5} />
        </div>

        <span
          style={{
            flex: 1,
            fontSize: '12px',
            fontWeight: '500',
            color: colors.textPrimary,
            fontFamily: fonts.mono,
          }}
        >
          {targetName}
        </span>

        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {severities.map(
            (sev) =>
              severityCounts[sev] > 0 && (
                <span
                  key={sev}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                    fontSize: '10px',
                    color: SEVERITY_COLORS[sev],
                    fontWeight: '500',
                  }}
                >
                  <span
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: SEVERITY_COLORS[sev],
                    }}
                  />
                  {severityCounts[sev]}
                </span>
              )
          )}
        </div>

        <span
          style={{
            padding: '2px 6px',
            background: colors.bgTertiary,
            borderRadius: '8px',
            fontSize: '10px',
            color: colors.textSecondary,
            fontWeight: '500',
          }}
        >
          {findings.length}
        </span>
      </button>

      {isExpanded && (
        <div
          style={{
            padding: '10px',
            paddingLeft: '36px',
            background: colors.bgTertiary,
            borderTop: `1px solid ${colors.borderLight}`,
          }}
        >
          {findings.map((finding) => (
            <FindingCard
              key={finding.id}
              finding={finding}
              isExpanded={selectedFinding?.id === finding.id}
              onToggle={() => onSelectFinding(selectedFinding?.id === finding.id ? null : finding)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TargetTypeSection({ targetType, targets, selectedFinding, onSelectFinding }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const typeConfig = TARGET_TYPE_CONFIG[targetType] || TARGET_TYPE_CONFIG.tool;
  const Icon = typeConfig.icon;

  const totalFindings = Object.values(targets).reduce((sum, arr) => sum + arr.length, 0);
  const targetCount = Object.keys(targets).length;

  return (
    <div style={{ marginBottom: '16px' }}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 14px',
          width: '100%',
          background: colors.bgCard,
          border: `1px solid ${colors.borderLight}`,
          borderRadius: '8px',
          cursor: 'pointer',
          textAlign: 'left',
          marginBottom: isExpanded ? '10px' : 0,
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.bgTertiary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = colors.bgCard;
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: `${typeConfig.color}15`,
            border: `1px solid ${typeConfig.color}30`,
          }}
        >
          <Icon size={16} color={typeConfig.color} stroke={1.5} />
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '13px',
              fontWeight: '500',
              color: colors.textPrimary,
              fontFamily: fonts.body,
            }}
          >
            {typeConfig.label}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: colors.textTertiary,
              fontFamily: fonts.body,
            }}
          >
            {targetCount} {targetCount === 1 ? 'target' : 'targets'} with issues
          </div>
        </div>

        <div style={{ textAlign: 'right', marginRight: '6px' }}>
          <div
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: typeConfig.color,
              lineHeight: 1,
            }}
          >
            {totalFindings}
          </div>
          <div style={{ fontSize: '10px', color: colors.textTertiary }}>
            {totalFindings === 1 ? 'finding' : 'findings'}
          </div>
        </div>

        {isExpanded ? (
          <IconChevronDown size={16} color={colors.textTertiary} />
        ) : (
          <IconChevronRight size={16} color={colors.textTertiary} />
        )}
      </button>

      {isExpanded && (
        <div style={{ marginLeft: '10px' }}>
          {Object.entries(targets)
            .sort((a, b) => b[1].length - a[1].length)
            .map(([targetName, findings]) => (
              <TargetGroup
                key={targetName}
                targetName={targetName}
                targetType={targetType}
                findings={findings}
                selectedFinding={selectedFinding}
                onSelectFinding={onSelectFinding}
              />
            ))}
        </div>
      )}
    </div>
  );
}

function TargetView({ findings, selectedFinding, onSelectFinding }) {
  const byType = {};

  for (const f of findings) {
    const targetType = f.target_type || 'tool';
    const targetName = f.target_name || 'Unknown';

    if (!byType[targetType]) byType[targetType] = {};
    if (!byType[targetType][targetName]) byType[targetType][targetName] = [];
    byType[targetType][targetName].push(f);
  }

  const typeOrder = ['tool', 'prompt', 'resource', 'server', 'packet'];
  const sortedTypes = typeOrder.filter((t) => byType[t] && Object.keys(byType[t]).length > 0);

  if (sortedTypes.length === 0) {
    return (
      <div
        style={{
          background: colors.bgCard,
          borderRadius: '8px',
          border: `1px solid ${colors.borderLight}`,
          padding: '40px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: '13px',
            color: colors.textSecondary,
            fontFamily: fonts.body,
            margin: 0,
          }}
        >
          No findings yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      {sortedTypes.map((targetType) => (
        <TargetTypeSection
          key={targetType}
          targetType={targetType}
          targets={byType[targetType]}
          selectedFinding={selectedFinding}
          onSelectFinding={onSelectFinding}
        />
      ))}
    </div>
  );
}

export default TargetView;
