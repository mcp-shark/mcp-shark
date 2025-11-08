import { useState, useEffect, useRef } from 'react';
import RequestList from './PacketList';
import RequestDetail from './PacketDetail';
import RequestFilters from './PacketFilters';
import CompositeSetup from './CompositeSetup';
import CompositeLogs from './CompositeLogs';
import TabNavigation from './TabNavigation';

function App() {
  const [activeTab, setActiveTab] = useState('traffic');
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({});
  const [stats, setStats] = useState(null);
  const [firstRequestTime, setFirstRequestTime] = useState(null);
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
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', background: '#1e1e1e' }}>
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

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
        <div style={{ flex: 1, overflow: 'auto' }}>
          <CompositeSetup />
        </div>
      )}
    </div>
  );
}

export default App;

