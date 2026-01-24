import { useState } from 'react';
import FindingsTable from './components/Security/FindingsTable';
import SecurityControls from './components/Security/SecurityControls';
import SecurityHeader from './components/Security/SecurityHeader';
import SecuritySummary from './components/Security/SecuritySummary';
import { useSecurity } from './components/Security/useSecurity';
import { colors } from './theme';

function Security() {
  const [viewMode, setViewMode] = useState('scan'); // 'scan' or 'findings'
  const {
    rules,
    findings,
    summary,
    scanning,
    error,
    discoverAndScan,
    clearFindings,
    loadFindings,
    loadSummary,
    filters,
    setFilters,
    selectedFinding,
    setSelectedFinding,
  } = useSecurity();

  return (
    <div
      data-tab-content
      style={{
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: colors.bgPrimary,
      }}
    >
      {/* Top Bar - Controls */}
      <div
        style={{
          background: colors.bgCard,
          borderBottom: `1px solid ${colors.borderLight}`,
          padding: '16px 24px',
          boxShadow: `0 2px 4px ${colors.shadowSm}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            flexWrap: 'wrap',
          }}
        >
          <SecurityHeader />
          <SecurityControls
            onScan={discoverAndScan}
            scanning={scanning}
            onClear={clearFindings}
            onRefresh={loadFindings}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px',
        }}
      >
        {error && (
          <div
            style={{
              padding: '12px 16px',
              background: colors.errorBg,
              border: `1px solid ${colors.error}`,
              borderRadius: '8px',
              color: colors.error,
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <SecuritySummary summary={summary} onRefresh={loadSummary} />

        {/* Findings Table */}
        <FindingsTable
          findings={findings}
          filters={filters}
          onFilterChange={setFilters}
          selectedFinding={selectedFinding}
          onSelectFinding={setSelectedFinding}
          rules={rules}
        />
      </div>
    </div>
  );
}

export default Security;
