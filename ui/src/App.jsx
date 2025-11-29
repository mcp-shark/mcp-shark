import { useEffect } from 'react';
import CompositeSetup from './CompositeSetup';
import CompositeLogs from './CompositeLogs';
import McpPlayground from './components/McpPlayground';
import SmartScan from './SmartScan';
import TabNavigation from './TabNavigation';
import IntroTour from './IntroTour';
import HelpButton from './components/App/HelpButton';
import TrafficTab from './components/App/TrafficTab';
import { colors } from './theme';
import { tourSteps } from './config/tourSteps.jsx';
import { fadeIn } from './utils/animations';
import { useAppState } from './components/App/useAppState';

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
    showTour,
    setShowTour,
    prevTabRef,
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
      {showTour && (
        <IntroTour
          steps={tourSteps}
          onComplete={() => setShowTour(false)}
          onSkip={() => setShowTour(false)}
          onStepChange={(stepIndex) => {
            const step = tourSteps[stepIndex];
            if (step) {
              if (
                step.target === '[data-tour="setup-tab"]' ||
                step.target === '[data-tour="detected-editors"]' ||
                step.target === '[data-tour="select-file"]' ||
                step.target === '[data-tour="start-button"]'
              ) {
                if (activeTab !== 'setup') {
                  setActiveTab('setup');
                }
              } else if (step.target === '[data-tour="traffic-tab"]') {
                if (activeTab !== 'traffic') {
                  setActiveTab('traffic');
                }
              }
            }
          }}
        />
      )}
      <div style={{ position: 'relative' }} data-tour="tabs">
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        <HelpButton onClick={() => setShowTour(true)} />
      </div>

      {activeTab === 'traffic' && (
        <TrafficTab
          requests={requests}
          selected={selected}
          onSelect={setSelected}
          filters={filters}
          onFilterChange={setFilters}
          stats={stats}
          firstRequestTime={firstRequestTime}
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
    </div>
  );
}

export default App;
