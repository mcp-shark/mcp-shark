import { useEffect } from 'react';
import CompositeLogs from './CompositeLogs';
import CompositeSetup from './CompositeSetup';
import Security from './Security';
import ShutdownPage from './ShutdownPage';
import SmartScan from './SmartScan';
import TabNavigation from './TabNavigation';
import AauthExplorerView from './components/AauthExplorer/AauthExplorerView';
import ActionMenu from './components/App/ActionMenu';
import TrafficTab from './components/App/TrafficTab';
import { useAppState } from './components/App/useAppState';
import McpPlayground from './components/McpPlayground';
import { colors } from './theme';
import { fadeIn } from './utils/animations';

function App() {
  const {
    activeTab,
    setActiveTab,
    requests,
    selected,
    setSelected,
    filters,
    setFilters,
    stats,
    firstRequestTime,
    prevTabRef,
    loadRequests,
  } = useAppState();

  useEffect(() => {
    if (prevTabRef.current !== activeTab) {
      const tabContent = document.querySelector('[data-tab-content]');
      if (tabContent) {
        fadeIn(tabContent, { duration: 300 });
      }
      prevTabRef.current = activeTab;
    }
  }, [activeTab, prevTabRef]);

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        flexDirection: 'column',
        background: colors.bgPrimary,
      }}
    >
      <div style={{ position: 'relative' }}>
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      <ActionMenu />

      {activeTab === 'traffic' && (
        <TrafficTab
          requests={requests}
          selected={selected}
          onSelect={setSelected}
          filters={filters}
          onFilterChange={setFilters}
          stats={stats}
          firstRequestTime={firstRequestTime}
          onClear={() => {
            setSelected(null);
            loadRequests();
          }}
        />
      )}

      {activeTab === 'logs' && (
        <div
          data-tab-content
          style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
          <CompositeLogs />
        </div>
      )}

      {activeTab === 'setup' && (
        <div
          data-tab-content
          style={{ flex: 1, overflow: 'hidden', width: '100%', height: '100%' }}
        >
          <CompositeSetup />
        </div>
      )}

      {activeTab === 'playground' && (
        <div
          data-tab-content
          style={{ flex: 1, overflow: 'hidden', width: '100%', height: '100%' }}
        >
          <McpPlayground />
        </div>
      )}

      {activeTab === 'smart-scan' && (
        <div data-tab-content style={{ flex: 1, overflow: 'auto', width: '100%', height: '100%' }}>
          <SmartScan />
        </div>
      )}

      {activeTab === 'shutdown' && (
        <div
          data-tab-content
          style={{ flex: 1, overflow: 'hidden', width: '100%', height: '100%' }}
        >
          <ShutdownPage />
        </div>
      )}

      {activeTab === 'security' && (
        <div data-tab-content style={{ flex: 1, overflow: 'auto', width: '100%', height: '100%' }}>
          <Security
            onNavigateToSmartScan={() => setActiveTab('smart-scan')}
            onNavigateToSetup={() => setActiveTab('setup')}
          />
        </div>
      )}

      {activeTab === 'aauth-explorer' && (
        <div
          data-tab-content
          style={{ flex: 1, overflow: 'hidden', width: '100%', height: '100%' }}
        >
          <AauthExplorerView
            onOpenPacket={(frameNumber) => {
              if (frameNumber == null) {
                return;
              }
              const target = requests?.find?.((r) => r.frame_number === frameNumber);
              if (target) {
                setSelected(target);
              } else {
                setSelected({ frame_number: frameNumber });
              }
              setActiveTab('traffic');
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
