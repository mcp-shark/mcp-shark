import { useState } from 'react';
import { RulesManager } from './components/Security/RulesManager';
import ScannerContent from './components/Security/ScannerContent';
import SecurityControls from './components/Security/SecurityControls';
import SecurityHeader from './components/Security/SecurityHeader';
import SecurityViewTabs from './components/Security/SecurityViewTabs';
import { useSecurity } from './components/Security/useSecurity';
import { colors } from './theme';

function Security() {
  const [activeTab, setActiveTab] = useState('scanner');
  const {
    rules,
    findings,
    summary,
    scanning,
    clearing,
    error,
    discoverAndScan,
    clearFindings,
    loadFindings,
    loadSummary,
    selectedFinding,
    setSelectedFinding,
    // YARA rules
    communityRules,
    engineStatus,
    setRuleEnabled,
    saveCustomRule,
    deleteCustomRule,
    resetDefaults,
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
          <SecurityViewTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          {activeTab === 'scanner' && (
            <SecurityControls
              onScan={discoverAndScan}
              scanning={scanning}
              onClear={clearFindings}
              clearing={clearing}
              onRefresh={loadFindings}
            />
          )}
        </div>
      </div>

      {/* Main Content */}
      {activeTab === 'scanner' && (
        <ScannerContent
          error={error}
          scanning={scanning}
          findings={findings}
          summary={summary}
          selectedFinding={selectedFinding}
          onSelectFinding={setSelectedFinding}
          rules={rules}
          loadSummary={loadSummary}
        />
      )}

      {activeTab === 'rules' && (
        <RulesManager
          communityRules={communityRules}
          engineStatus={engineStatus}
          onToggleRule={setRuleEnabled}
          onSaveRule={saveCustomRule}
          onDeleteRule={deleteCustomRule}
          onResetDefaults={resetDefaults}
        />
      )}
    </div>
  );
}

export default Security;
