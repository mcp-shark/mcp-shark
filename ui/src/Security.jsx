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
            gap: '24px',
            flexWrap: 'wrap',
          }}
        >
          <SecurityHeader />
          {activeTab === 'scanner' && (
            <SecurityControls
              onScan={discoverAndScan}
              scanning={scanning}
              onClear={clearFindings}
              onRefresh={loadFindings}
            />
          )}

          {/* Tab Switcher */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              border: `1px solid ${colors.borderLight}`,
              borderRadius: '8px',
              padding: '4px',
              background: colors.bgSecondary,
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('scanner')}
              style={{
                padding: '6px 14px',
                background: activeTab === 'scanner' ? colors.bgCard : 'transparent',
                border: 'none',
                color: activeTab === 'scanner' ? colors.textPrimary : colors.textSecondary,
                borderRadius: '6px',
                fontSize: '12px',
                fontFamily: fonts.body,
                fontWeight: activeTab === 'scanner' ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Scanner
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rules')}
              style={{
                padding: '6px 14px',
                background: activeTab === 'rules' ? colors.bgCard : 'transparent',
                border: 'none',
                color: activeTab === 'rules' ? colors.textPrimary : colors.textSecondary,
                borderRadius: '6px',
                fontSize: '12px',
                fontFamily: fonts.body,
                fontWeight: activeTab === 'rules' ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s',
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
