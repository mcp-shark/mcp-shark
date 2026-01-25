import {
  IconAlertCircle,
  IconAlertTriangle,
  IconFilter,
  IconInfoCircle,
} from '@tabler/icons-react';
import { useState } from 'react';
import { colors, fonts } from '../../theme';
import FindingCard from './FindingCard.jsx';

const SEVERITY_FILTERS = [
  { id: 'all', label: 'All', color: colors.textSecondary },
  { id: 'critical', label: 'Critical', color: '#dc2626', icon: IconAlertCircle },
  { id: 'high', label: 'High', color: '#ea580c', icon: IconAlertTriangle },
  { id: 'medium', label: 'Medium', color: '#ca8a04', icon: IconAlertTriangle },
  { id: 'low', label: 'Low', color: '#2563eb', icon: IconInfoCircle },
  { id: 'info', label: 'Info', color: '#6b7280', icon: IconInfoCircle },
];

function FilterButton({ filter, isActive, count, onClick }) {
  const Icon = filter.icon;

  return (
    <button
      onClick={onClick}
      type="button"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        background: isActive ? `${filter.color}15` : colors.bgCard,
        color: isActive ? filter.color : colors.textSecondary,
        border: `1px solid ${isActive ? filter.color : colors.borderLight}`,
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: isActive ? '600' : '500',
        fontFamily: fonts.body,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = colors.bgSecondary;
          e.currentTarget.style.borderColor = colors.borderMedium;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = colors.bgCard;
          e.currentTarget.style.borderColor = colors.borderLight;
        }
      }}
    >
      {Icon && <Icon size={14} />}
      {filter.label}
      {count > 0 && (
        <span
          style={{
            padding: '2px 6px',
            background: isActive ? filter.color : colors.bgSecondary,
            color: isActive ? '#fff' : colors.textSecondary,
            borderRadius: '10px',
            fontSize: '10px',
            fontWeight: '600',
            minWidth: '18px',
            textAlign: 'center',
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function FindingsTable({ findings, selectedFinding, onSelectFinding }) {
  const [severityFilter, setSeverityFilter] = useState('all');

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
          No findings yet. Run a scan to detect vulnerabilities.
        </div>
      </div>
    );
  }

  // Count findings by severity
  const severityCounts = findings.reduce((acc, finding) => {
    const severity = finding.severity || 'info';
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {});

  // Filter findings
  const filteredFindings =
    severityFilter === 'all' ? findings : findings.filter((f) => f.severity === severityFilter);

  // Sort by severity (critical first)
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  const sortedFindings = [...filteredFindings].sort(
    (a, b) => (severityOrder[a.severity] || 4) - (severityOrder[b.severity] || 4)
  );

  return (
    <div>
      {/* Header with filters */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconFilter size={14} color={colors.textSecondary} />
          <span
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: colors.textSecondary,
              fontFamily: fonts.body,
              textTransform: 'uppercase',
            }}
          >
            Filter by Severity
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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

      {/* Results count */}
      <div
        style={{
          fontSize: '13px',
          color: colors.textSecondary,
          fontFamily: fonts.body,
          marginBottom: '16px',
        }}
      >
        Showing <strong style={{ color: colors.textPrimary }}>{sortedFindings.length}</strong>
        {severityFilter !== 'all' && <span> {severityFilter} </span>}
        {sortedFindings.length === 1 ? ' finding' : ' findings'}
        {severityFilter !== 'all' && findings.length !== sortedFindings.length && (
          <span style={{ color: colors.textTertiary }}> (of {findings.length} total)</span>
        )}
      </div>

      {/* Findings list */}
      <div>
        {sortedFindings.length === 0 ? (
          <div
            style={{
              background: colors.bgCard,
              borderRadius: '12px',
              border: `1px solid ${colors.borderLight}`,
              padding: '32px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '14px',
                color: colors.textSecondary,
                fontFamily: fonts.body,
              }}
            >
              No {severityFilter} severity findings found.
            </div>
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
