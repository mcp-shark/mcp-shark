import { IconCategory, IconChartBar, IconList, IconTool } from '@tabler/icons-react';
import { useState } from 'react';
import { colors, fonts } from '../../theme';
import CategoryView from './CategoryView.jsx';
import ErrorDisplay from './ErrorDisplay.jsx';
import FindingsTable from './FindingsTable.jsx';
import ScannerEmptyState from './ScannerEmptyState.jsx';
import ScanningProgress from './ScanningProgress.jsx';
import SecurityCharts from './SecurityCharts.jsx';
import SecuritySummary from './SecuritySummary.jsx';
import TargetView from './TargetView.jsx';

const VIEW_MODES = [
  { id: 'dashboard', label: 'Dashboard', icon: IconChartBar },
  { id: 'severity', label: 'By Severity', icon: IconList },
  { id: 'category', label: 'By Category', icon: IconCategory },
  { id: 'target', label: 'By Target', icon: IconTool },
];

function ViewModeToggle({ viewMode, onViewModeChange }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px',
        background: colors.bgSecondary,
        borderRadius: '10px',
        border: `1px solid ${colors.borderLight}`,
      }}
    >
      {VIEW_MODES.map((mode) => {
        const Icon = mode.icon;
        const isActive = viewMode === mode.id;

        return (
          <button
            key={mode.id}
            onClick={() => onViewModeChange(mode.id)}
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: isActive ? colors.bgCard : 'transparent',
              color: isActive ? colors.textPrimary : colors.textSecondary,
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: isActive ? '600' : '500',
              fontFamily: fonts.body,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: isActive ? `0 1px 3px ${colors.shadowSm}` : 'none',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = colors.bgCard;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <Icon size={14} />
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}

export default function ScannerContent({
  error,
  scanning,
  findings,
  summary,
  selectedFinding,
  onSelectFinding,
  rules,
  loadSummary,
}) {
  const [viewMode, setViewMode] = useState('dashboard');
  const hasFindings = findings && findings.length > 0;
  const showEmpty = !error && !scanning && !hasFindings;

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '24px',
        background: colors.bgPrimary,
      }}
    >
      <ErrorDisplay error={error} />
      <ScanningProgress scanning={scanning} />

      {showEmpty && <ScannerEmptyState />}

      {hasFindings && !scanning && (
        <>
          {/* Header row with summary and view toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '16px',
              marginBottom: '24px',
              flexWrap: 'wrap',
            }}
          >
            <SecuritySummary summary={summary} onRefresh={loadSummary} />
            <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>

          {/* Dashboard view with charts */}
          {viewMode === 'dashboard' && (
            <>
              <SecurityCharts findings={findings} />
              <FindingsTable
                findings={findings}
                selectedFinding={selectedFinding}
                onSelectFinding={onSelectFinding}
                rules={rules}
                showFilter={false}
              />
            </>
          )}

          {/* Severity list view */}
          {viewMode === 'severity' && (
            <FindingsTable
              findings={findings}
              selectedFinding={selectedFinding}
              onSelectFinding={onSelectFinding}
              rules={rules}
            />
          )}

          {/* Category grouped view */}
          {viewMode === 'category' && (
            <CategoryView
              findings={findings}
              selectedFinding={selectedFinding}
              onSelectFinding={onSelectFinding}
            />
          )}

          {/* Target grouped view */}
          {viewMode === 'target' && (
            <TargetView
              findings={findings}
              selectedFinding={selectedFinding}
              onSelectFinding={onSelectFinding}
            />
          )}
        </>
      )}
    </div>
  );
}
