import { useState, useEffect, useRef } from 'react';
import RequestList from './PacketList';
import RequestDetail from './PacketDetail';
import RequestFilters from './PacketFilters';
import CompositeSetup from './CompositeSetup';
import CompositeLogs from './CompositeLogs';
import TabNavigation from './TabNavigation';
import IntroTour from './IntroTour';
import { colors, fonts } from './theme';
import { tourSteps } from './config/tourSteps.jsx';

// SVG Icon Component
const HelpIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

function App() {
  const [activeTab, setActiveTab] = useState('traffic');
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({});
  const [stats, setStats] = useState(null);
  const [firstRequestTime, setFirstRequestTime] = useState(null);
  const [showTour, setShowTour] = useState(false);
  const [tourDismissed, setTourDismissed] = useState(true);
  const wsRef = useRef(null);

  const loadRequests = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.serverName) queryParams.append('serverName', filters.serverName);
      if (filters.sessionId) queryParams.append('sessionId', filters.sessionId);
      if (filters.direction) queryParams.append('direction', filters.direction);
      if (filters.method) queryParams.append('method', filters.method);
      if (filters.jsonrpcMethod) queryParams.append('jsonrpcMethod', filters.jsonrpcMethod);
      if (filters.statusCode) queryParams.append('statusCode', filters.statusCode);
      if (filters.jsonrpcId) queryParams.append('jsonrpcId', filters.jsonrpcId);
      queryParams.append('limit', '5000');

      const response = await fetch(`/api/requests?${queryParams}`);
      const data = await response.json();
      setRequests(data);

      if (data.length > 0) {
        // For descending order (latest first), use the last entry as the reference time
        // The last entry in DESC order is the oldest one
        const oldest = data[data.length - 1]?.timestamp_iso;
        if (oldest) {
          setFirstRequestTime(oldest);
        }
      }

      // Load statistics
      const statsResponse = await fetch(`/api/statistics?${queryParams}`);
      const statsData = await statsResponse.json();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
  };

  useEffect(() => {
    // Check tour state on mount (profile-specific, stored in ~/.mcp-shark/help-state.json)
    const checkTourState = async () => {
      try {
        const response = await fetch('/api/help/state');
        const data = await response.json();
        setTourDismissed(data.dismissed || data.tourCompleted);
        // Only show tour if it hasn't been completed/dismissed
        if (!data.dismissed && !data.tourCompleted) {
          // Small delay to ensure DOM is ready
          setTimeout(() => {
            setShowTour(true);
          }, 500);
        }
      } catch (error) {
        console.error('Failed to load tour state:', error);
        // Show tour by default if we can't check state (first time user)
        setTimeout(() => {
          setShowTour(true);
        }, 500);
        setTourDismissed(false);
      }
    };

    checkTourState();
    loadRequests();

    const wsUrl = import.meta.env.DEV
      ? 'ws://localhost:9853'
      : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'update') {
        setRequests(msg.data);
        if (msg.data.length > 0) {
          // For descending order (latest first), use the last entry as the reference time
          const oldest = msg.data[msg.data.length - 1]?.timestamp_iso;
          if (oldest) {
            setFirstRequestTime(oldest);
          }
        }
      }
    };

    return () => ws.close();
  }, []);

  useEffect(() => {
    loadRequests();
  }, [filters]);

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
            // Auto-switch tabs based on tour step
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
        <button
          onClick={() => setShowTour(true)}
          data-tour="help-button"
          style={{
            position: 'absolute',
            top: '12px',
            right: '16px',
            background: colors.bgCard,
            border: `1px solid ${colors.borderLight}`,
            borderRadius: '8px',
            padding: '8px 12px',
            color: colors.textSecondary,
            cursor: 'pointer',
            fontFamily: fonts.body,
            fontSize: '12px',
            fontWeight: '500',
            boxShadow: `0 2px 4px ${colors.shadowSm}`,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            zIndex: 100,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.bgHover;
            e.currentTarget.style.color = colors.textPrimary;
            e.currentTarget.style.borderColor = colors.borderMedium;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.bgCard;
            e.currentTarget.style.color = colors.textSecondary;
            e.currentTarget.style.borderColor = colors.borderLight;
          }}
          title="Start interactive tour"
        >
          <HelpIcon size={14} />
          Start Tour
        </button>
      </div>

      {activeTab === 'traffic' && (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
          <div
            style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}
          >
            <RequestFilters
              filters={filters}
              onFilterChange={setFilters}
              stats={stats}
              onExport={() => {}}
            />
            <RequestList
              requests={requests}
              selected={selected}
              onSelect={setSelected}
              firstRequestTime={firstRequestTime}
            />
          </div>
          {selected && (
            <div
              style={{
                width: '600px',
                borderLeft: `1px solid ${colors.borderLight}`,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                background: colors.bgCard,
              }}
            >
              <RequestDetail request={selected} onClose={() => setSelected(null)} />
            </div>
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <CompositeLogs />
        </div>
      )}

      {activeTab === 'setup' && (
        <div style={{ flex: 1, overflow: 'hidden', width: '100%', height: '100%' }}>
          <CompositeSetup />
        </div>
      )}
    </div>
  );
}

export default App;
