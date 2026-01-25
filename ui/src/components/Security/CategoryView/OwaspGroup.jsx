import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { useState } from 'react';
import { colors, fonts } from '../../../theme.js';
import FindingCard from '../FindingCard/index.js';
import { OWASP_DESCRIPTIONS, SEVERITY_COLORS } from './constants.js';

export function OwaspGroup({ owaspId, findings, selectedFinding, onSelectFinding }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const description = OWASP_DESCRIPTIONS[owaspId] || owaspId;

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
          gap: '10px',
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

        <span
          style={{
            padding: '2px 6px',
            background: colors.bgTertiary,
            color: colors.textSecondary,
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: '600',
            fontFamily: fonts.mono,
          }}
        >
          {owaspId}
        </span>

        <span
          style={{
            flex: 1,
            fontSize: '12px',
            color: colors.textPrimary,
            fontFamily: fonts.body,
          }}
        >
          {description}
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
            paddingLeft: '24px',
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
