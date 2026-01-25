import { useState } from 'react';
import { colors, fonts } from '../../theme';
import FindingCard from './FindingCard.jsx';

const SEVERITY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'critical', label: 'Critical', color: colors.error },
  { id: 'high', label: 'High', color: '#ea580c' },
  { id: 'medium', label: 'Medium', color: '#b45309' },
  { id: 'low', label: 'Low', color: colors.accentBlue },
  { id: 'info', label: 'Info', color: colors.textTertiary },
];

function FilterButton({ filter, isActive, count, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 10px',
        background: isActive ? `${colors.accentBlue}15` : colors.bgCard,
        color: isActive ? colors.accentBlue : colors.textSecondary,
        border: `1px solid ${isActive ? colors.accentBlue : colors.borderLight}`,
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: isActive ? '600' : '400',
        fontFamily: fonts.body,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = colors.bgTertiary;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = colors.bgCard;
        }
      }}
    >
      {filter.color && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: filter.color,
          }}
        />
      )}
      {filter.label}
      {count > 0 && (
        <span
          style={{
            padding: '1px 5px',
            background: isActive ? colors.accentBlue : colors.bgTertiary,
            color: isActive ? colors.textInverse : colors.textSecondary,
            borderRadius: '8px',
            fontSize: '9px',
            fontWeight: '600',
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function FindingsTable({ findings, selectedFinding, onSelectFinding, showFilter = true }) {
  const [severityFilter, setSeverityFilter] = useState('all');

  if (!findings || findings.length === 0) {
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
          No findings yet. Run a scan to detect vulnerabilities.
        </p>
      </div>
    );
  }

  const severityCounts = findings.reduce((acc, finding) => {
    const severity = finding.severity || 'info';
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {});

  const filteredFindings =
    severityFilter === 'all' ? findings : findings.filter((f) => f.severity === severityFilter);

  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  const sortedFindings = [...filteredFindings].sort(
    (a, b) => (severityOrder[a.severity] || 4) - (severityOrder[b.severity] || 4)
  );

  return (
    <div>
      {showFilter && (
        <div style={{ marginBottom: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <span
              style={{
                fontSize: '10px',
                fontWeight: '600',
                color: colors.textTertiary,
                fontFamily: fonts.body,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Filter by Severity
            </span>
            <span
              style={{
                fontSize: '11px',
                color: colors.textTertiary,
                fontFamily: fonts.body,
              }}
            >
              {sortedFindings.length} of {findings.length}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {SEVERITY_FILTERS.map((filter) => (
              <FilterButton
                key={filter.id}
                filter={filter}
                isActive={severityFilter === filter.id}
                count={filter.id === 'all' ? findings.length : severityCounts[filter.id] || 0}
                onClick={() => setSeverityFilter(filter.id)}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        {sortedFindings.length === 0 ? (
          <div
            style={{
              background: colors.bgCard,
              borderRadius: '8px',
              border: `1px solid ${colors.borderLight}`,
              padding: '24px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: '12px',
                color: colors.textSecondary,
                fontFamily: fonts.body,
                margin: 0,
              }}
            >
              No {severityFilter} severity findings.
            </p>
          </div>
        ) : (
          sortedFindings.map((finding) => (
            <FindingCard
              key={finding.id}
              finding={finding}
              isExpanded={selectedFinding?.id === finding.id}
              onToggle={() => onSelectFinding(selectedFinding?.id === finding.id ? null : finding)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default FindingsTable;
