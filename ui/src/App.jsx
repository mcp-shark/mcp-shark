import { useState, useEffect, useRef } from 'react';
import RequestList from './PacketList';
import RequestDetail from './PacketDetail';
import RequestFilters from './PacketFilters';
import CompositeSetup from './CompositeSetup';
import CompositeLogs from './CompositeLogs';
import TabNavigation from './TabNavigation';
import IntroTour from './IntroTour';

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

  // Define tour steps - focused on setup workflow
  const tourSteps = [
    {
      target: '[data-tour="tabs"]',
      title: 'Welcome to MCP Shark!',
      content: (
        <div>
          <p style={{ margin: '0 0 12px 0' }}>
            MCP Shark is a powerful tool for monitoring and analyzing Model Context Protocol (MCP)
            communications. Let's get you started!
          </p>
          <p style={{ margin: 0 }}>
            First, you'll need to set up the MCP Shark server. Click on the{' '}
            <strong>MCP Server Setup</strong> tab to begin.
          </p>
        </div>
      ),
      position: 'bottom',
    },
    {
      target: '[data-tour="setup-tab"]',
      title: 'Step 1: Open MCP Server Setup',
      content: (
        <div>
          <p style={{ margin: '0 0 8px 0' }}>
            Click on the <strong>MCP Server Setup</strong> tab to configure and start the MCP Shark
            server.
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#858585' }}>
            This is where you'll configure your MCP servers and start monitoring.
          </p>
        </div>
      ),
      position: 'bottom',
    },
    {
      target: '[data-tour="detected-editors"]',
      title: 'Step 2: Select Your Configuration',
      content: (
        <div>
          <p style={{ margin: '0 0 8px 0' }}>
            MCP Shark automatically detects your IDE's MCP configuration files. You have two
            options:
          </p>
          <ul style={{ margin: '0 0 8px 0', paddingLeft: '20px', fontSize: '13px' }}>
            <li>
              Click on any <strong>detected editor</strong> (like Cursor or Windsurf) to use its
              config
            </li>
            <li>
              Or click <strong>"Select File"</strong> to upload your own config file
            </li>
          </ul>
          <p style={{ margin: 0, fontSize: '12px', color: '#858585' }}>
            When you click a detected editor, the file path will automatically populate in the text
            box.
          </p>
        </div>
      ),
      position: 'bottom',
    },
    {
      target: '[data-tour="select-file"]',
      title: 'Alternative: Upload Your Config',
      content: (
        <div>
          <p style={{ margin: '0 0 8px 0' }}>
            If you prefer, you can click <strong>"Select File"</strong> to upload your MCP
            configuration file directly.
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#858585' }}>
            Or manually enter the file path in the text box next to it.
          </p>
        </div>
      ),
      position: 'bottom',
    },
    {
      target: '[data-tour="start-button"]',
      title: 'Step 3: Start MCP Shark',
      content: (
        <div>
          <p style={{ margin: '0 0 8px 0' }}>
            Once you've selected a configuration file (either from detected editors or uploaded),
            click <strong>"Start MCP Shark"</strong> to begin monitoring.
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#858585' }}>
            The server will start and begin capturing all MCP traffic between your IDE and servers.
          </p>
        </div>
      ),
      position: 'top',
    },
    {
      target: '[data-tour="traffic-tab"]',
      title: 'View Your Traffic',
      content: (
        <div>
          <p style={{ margin: '0 0 8px 0' }}>
            After starting the server, switch to the <strong>Traffic Capture</strong> tab to see all
            HTTP requests and responses in real-time.
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#858585' }}>
            You can view traffic as a flat list, grouped by session, or grouped by server.
          </p>
        </div>
      ),
      position: 'bottom',
    },
    {
      target: '[data-tour="help-button"]',
      title: 'Need Help?',
      content: (
        <div>
          <p style={{ margin: '0 0 8px 0' }}>
            Click the <strong>Start Tour</strong> button anytime to restart this guide or get help.
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#858585' }}>
            You're all set! Start by configuring your MCP server, then watch the traffic flow.
          </p>
        </div>
      ),
      position: 'left',
    },
  ];

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
      style={{ display: 'flex', height: '100vh', flexDirection: 'column', background: '#1e1e1e' }}
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
            background: '#252526',
            border: '1px solid #3e3e42',
            borderRadius: '4px',
            padding: '6px 10px',
            color: '#858585',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            zIndex: 100,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#2d2d30';
            e.currentTarget.style.color = '#d4d4d4';
            e.currentTarget.style.borderColor = '#3e3e42';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#252526';
            e.currentTarget.style.color = '#858585';
            e.currentTarget.style.borderColor = '#3e3e42';
          }}
          title="Start interactive tour"
        >
          <HelpIcon size={14} />
          Start Tour
        </button>
      </div>

      {activeTab === 'traffic' && (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <RequestFilters filters={filters} onFilterChange={setFilters} stats={stats} />
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
                borderLeft: '1px solid #3e3e42',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
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
