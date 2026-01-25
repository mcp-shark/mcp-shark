import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { useState } from 'react';
import { colors, fonts } from '../../../theme.js';
import FindingCard from '../FindingCard/index.js';
import { SEVERITY_COLORS, TARGET_TYPE_CONFIG } from './constants.js';

export function TargetGroup({
  targetName,
  targetType,
  findings,
  selectedFinding,
  onSelectFinding,
}) {
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
