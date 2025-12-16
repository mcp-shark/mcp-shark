import { useEffect, useState } from 'react';
import CompositeLogs from './CompositeLogs';
import CompositeSetup from './CompositeSetup';
import IntroTour from './IntroTour';
import SmartScan from './SmartScan';
import TabNavigation from './TabNavigation';
import HelpButton from './components/App/HelpButton';
import TrafficTab from './components/App/TrafficTab';
import { useAppState } from './components/App/useAppState';
import McpPlayground from './components/McpPlayground';
import { tourSteps } from './config/tourSteps.jsx';
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
    showTour,
    setShowTour,
    prevTabRef,
    loadRequests,
  } = useAppState();
  const [tourKey, setTourKey] = useState(0);

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
          key={tourKey}
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
              } else if (step.target === '[data-tour="smart-scan-tab"]') {
                if (activeTab !== 'smart-scan') {
                  setActiveTab('smart-scan');
                }
              }
            }
          }}
        />
      )}
      <div style={{ position: 'relative' }} data-tour="tabs">
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      <HelpButton
        onClick={() => {
          if (showTour) {
            setShowTour(false);
            setTourKey((prev) => prev + 1);
            setTimeout(() => {
              setShowTour(true);
            }, 100);
          } else {
            setTourKey((prev) => prev + 1);
            setShowTour(true);
          }
        }}
      />

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
    </div>
  );
}

export default App;
