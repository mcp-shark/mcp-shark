import {
  IconArrowRight,
  IconCategory,
  IconChartBar,
  IconCode,
  IconList,
  IconSparkles,
  IconTool,
} from '@tabler/icons-react';
import { useState } from 'react';
import { colors, fonts } from '../../theme';
import CategoryView from './CategoryView/index.js';
import ErrorDisplay from './ErrorDisplay.jsx';
import FindingsTable from './FindingsTable.jsx';
import ScanHistory from './ScanHistory.jsx';
import ScannerEmptyState from './ScannerEmptyState.jsx';
import ScanningProgress from './ScanningProgress.jsx';
import SecurityCharts from './SecurityCharts/index.js';
import SecuritySummary from './SecuritySummary.jsx';
import TargetView from './TargetView/index.js';

const VIEW_MODES = [
  { id: 'dashboard', label: 'Dashboard', icon: IconChartBar },
  { id: 'severity', label: 'By Severity', icon: IconList },
  { id: 'category', label: 'By Category', icon: IconCategory },
  { id: 'target', label: 'By Target', icon: IconTool },
];

function StaticAnalysisBanner({ onNavigateToSmartScan }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        padding: '10px 16px',
        marginBottom: '16px',
        background: colors.bgSecondary,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: '6px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <IconCode size={16} stroke={1.5} style={{ color: colors.textMuted, flexShrink: 0 }} />
        <span
          style={{
            fontSize: '12px',
            color: colors.textSecondary,
            fontFamily: fonts.body,
          }}
        >
          <strong style={{ color: colors.textPrimary }}>Static Analysis</strong> — Rule-based
          pattern matching on MCP configurations. For deeper semantic analysis, try AI-powered
          scanning.
        </span>
      </div>

      <button
        type="button"
        onClick={onNavigateToSmartScan}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          background: colors.accentGreen,
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 500,
          fontFamily: fonts.body,
          cursor: 'pointer',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.9';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
      >
        <IconSparkles size={13} stroke={2} />
        Try AI-Powered Smart Scan
        <IconArrowRight size={12} stroke={2} />
      </button>
    </div>
  );
}

function ViewModeToggle({ viewMode, onViewModeChange }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: colors.bgTertiary,
        borderRadius: '6px',
        border: `1px solid ${colors.borderLight}`,
        padding: '2px',
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
              gap: '5px',
              padding: '5px 10px',
              background: isActive ? colors.bgCard : 'transparent',
              color: isActive ? colors.textPrimary : colors.textSecondary,
              border: 'none',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: isActive ? '500' : '400',
              fontFamily: fonts.body,
              cursor: 'pointer',
              transition: 'all 0.15s',
              boxShadow: isActive ? `0 1px 2px ${colors.shadowSm}` : 'none',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = colors.textPrimary;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = colors.textSecondary;
              }
            }}
          >
            <Icon size={12} stroke={1.5} />
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
  loadSummary,
  onNavigateToSmartScan,
  onNavigateToSetup,
  scanHistory,
  selectedScanId,
  onSelectScan,
  showHistory,
}) {
  const [viewMode, setViewMode] = useState('dashboard');
  const hasFindings = findings && findings.length > 0;
  const showEmpty = !error && !scanning && !hasFindings && !showHistory;

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '20px',
        background: colors.bgPrimary,
      }}
    >
      <ErrorDisplay error={error} onNavigateToSetup={onNavigateToSetup} />
      <ScanningProgress scanning={scanning} />

      {!error && !scanning && (
        <StaticAnalysisBanner onNavigateToSmartScan={onNavigateToSmartScan} />
      )}

      {/* History View */}
      {showHistory && !scanning && (
        <ScanHistory
          history={scanHistory}
          onSelectScan={onSelectScan}
          selectedScanId={selectedScanId}
          expanded={true}
        />
      )}

      {/* Empty State - only when not showing history */}
      {showEmpty && <ScannerEmptyState onNavigateToSetup={onNavigateToSetup} />}

      {/* Dashboard View - show when not in history mode OR when a historical scan is selected */}
      {hasFindings && !scanning && !error && (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              marginBottom: '16px',
              flexWrap: 'wrap',
            }}
          >
            <SecuritySummary summary={summary} onRefresh={loadSummary} />
            <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>

          {viewMode === 'dashboard' && (
            <>
              <SecurityCharts findings={findings} />
              <FindingsTable
                findings={findings}
                selectedFinding={selectedFinding}
                onSelectFinding={onSelectFinding}
                showFilter={false}
              />
            </>
          )}

          {viewMode === 'severity' && (
            <FindingsTable
              findings={findings}
              selectedFinding={selectedFinding}
              onSelectFinding={onSelectFinding}
            />
          )}

          {viewMode === 'category' && (
            <CategoryView
              findings={findings}
              selectedFinding={selectedFinding}
              onSelectFinding={onSelectFinding}
            />
          )}

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
