import { useState } from 'react';
import FindingsTable from './components/Security/FindingsTable';
import { RulesManager } from './components/Security/RulesManager';
import SecurityControls from './components/Security/SecurityControls';
import SecurityHeader from './components/Security/SecurityHeader';
import SecuritySummary from './components/Security/SecuritySummary';
import { useSecurity } from './components/Security/useSecurity';
import { colors, fonts } from './theme';

function Security() {
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner' or 'rules'
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
    // Community rules
    communityRules,
    ruleSources,
    rulesSummary,
    syncing,
    engineStatus,
    initializeSources,
    syncAllSources,
    syncSource,
    setRuleEnabled,
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
            justifyContent: 'space-between',
            gap: '24px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <SecurityHeader />
            {activeTab === 'scanner' && (
              <SecurityControls
                onScan={discoverAndScan}
                scanning={scanning}
                onClear={clearFindings}
                onRefresh={loadFindings}
              />
            )}
          </div>

          {/* Tab Switcher */}
          <div
            style={{
              display: 'flex',
              gap: '4px',
              background: colors.surface,
              borderRadius: '6px',
              padding: '4px',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('scanner')}
              style={{
                padding: '6px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: fonts.sizes.sm,
                fontWeight: 500,
                background: activeTab === 'scanner' ? colors.accent : 'transparent',
                color: activeTab === 'scanner' ? '#fff' : colors.textMuted,
              }}
            >
              Scanner
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rules')}
              style={{
                padding: '6px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: fonts.sizes.sm,
                fontWeight: 500,
                background: activeTab === 'rules' ? colors.accent : 'transparent',
                color: activeTab === 'rules' ? '#fff' : colors.textMuted,
              }}
            >
              Community Rules
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: activeTab === 'scanner' ? '24px' : '0',
        }}
      >
        {activeTab === 'scanner' && (
          <>
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
          </>
        )}

        {activeTab === 'rules' && (
          <RulesManager
            ruleSources={ruleSources}
            communityRules={communityRules}
            rulesSummary={rulesSummary}
            syncing={syncing}
            engineStatus={engineStatus}
            onInitialize={initializeSources}
            onSyncAll={syncAllSources}
            onSyncSource={syncSource}
            onToggleRule={setRuleEnabled}
          />
        )}
      </div>
    </div>
  );
}

export default Security;
