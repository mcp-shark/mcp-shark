import { useEffect, useRef, useState } from 'react';

function appendFilterParams(queryParams, filters) {
  if (filters.search) {
    queryParams.append('search', filters.search);
  }
  if (filters.serverName) {
    queryParams.append('serverName', filters.serverName);
  }
  if (filters.sessionId) {
    queryParams.append('sessionId', filters.sessionId);
  }
  if (filters.method) {
    queryParams.append('method', filters.method);
  }
  if (filters.jsonrpcMethod) {
    queryParams.append('jsonrpcMethod', filters.jsonrpcMethod);
  }
  if (filters.statusCode) {
    queryParams.append('statusCode', filters.statusCode);
  }
  if (filters.jsonrpcId) {
    queryParams.append('jsonrpcId', filters.jsonrpcId);
  }
}

const VALID_TABS = ['traffic', 'logs', 'setup', 'playground', 'smart-scan'];
const DEFAULT_TAB = 'traffic';

function getTabFromHash() {
  const hash = window.location.hash.slice(1); // Remove '#'
  const tab = hash.startsWith('/') ? hash.slice(1) : hash; // Remove leading '/'
  return VALID_TABS.includes(tab) ? tab : DEFAULT_TAB;
}

function updateUrlHash(tab) {
  const newHash = `#/${tab}`;
  if (window.location.hash !== newHash) {
    window.history.replaceState(null, '', newHash);
  }
}

export function useAppState() {
  const [activeTab, setActiveTab] = useState(() => getTabFromHash());
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({});
  const [stats, setStats] = useState(null);
  const [firstRequestTime, setFirstRequestTime] = useState(null);
  const [showTour, setShowTour] = useState(false);
  const [tourDismissed, setTourDismissed] = useState(true);
  const wsRef = useRef(null);
  const prevTabRef = useRef(activeTab);
  const filtersRef = useRef(filters);

  // Initialize URL hash on mount if missing
  useEffect(() => {
    if (!window.location.hash || window.location.hash === '#') {
      const initialTab = getTabFromHash();
      updateUrlHash(initialTab);
    }
  }, []);

  // Sync URL hash with activeTab
  useEffect(() => {
    updateUrlHash(activeTab);
  }, [activeTab]);

  // Listen for hash changes (back/forward buttons)
  useEffect(() => {
    const handleHashChange = () => {
      const tabFromHash = getTabFromHash();
      if (tabFromHash !== activeTab) {
        setActiveTab(tabFromHash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTab]);

  const loadStatistics = async () => {
    try {
      const queryParams = new URLSearchParams();
      appendFilterParams(queryParams, filters);

      const statsResponse = await fetch(`/api/statistics?${queryParams}`);
      const statsData = await statsResponse.json();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const loadRequests = async () => {
    try {
      const queryParams = new URLSearchParams();
      appendFilterParams(queryParams, filters);
      queryParams.append('limit', '5000');

      const response = await fetch(`/api/requests?${queryParams}`);
      const data = await response.json();
      setRequests(data);

      if (data.length > 0) {
        const oldest = data[data.length - 1]?.timestamp_iso;
        if (oldest) {
          setFirstRequestTime(oldest);
        }
      }

      // Also load statistics when loading requests
      await loadStatistics();
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
  };

  useEffect(() => {
    const checkTourState = async () => {
      try {
        const response = await fetch('/api/help/state');
        const data = await response.json();
        setTourDismissed(data.dismissed || data.tourCompleted);
        if (!data.dismissed && !data.tourCompleted) {
          setTimeout(() => {
            setShowTour(true);
          }, 500);
        }
      } catch (error) {
        console.error('Failed to load tour state:', error);
        setTimeout(() => {
          setShowTour(true);
        }, 500);
        setTourDismissed(false);
      }
    };

    const initData = async () => {
      try {
        const queryParams = new URLSearchParams();
        appendFilterParams(queryParams, filters);
        queryParams.append('limit', '5000');

        const response = await fetch(`/api/requests?${queryParams}`);
        const data = await response.json();
        setRequests(data);

        if (data.length > 0) {
          const oldest = data[data.length - 1]?.timestamp_iso;
          if (oldest) {
            setFirstRequestTime(oldest);
          }
        }

        // Also load statistics
        const statsQueryParams = new URLSearchParams();
        appendFilterParams(statsQueryParams, filters);

        const statsResponse = await fetch(`/api/statistics?${statsQueryParams}`);
        const statsData = await statsResponse.json();
        setStats(statsData);
      } catch (error) {
        console.error('Failed to load requests:', error);
      }
    };

    checkTourState();
    initData();

    const wsUrl = import.meta.env.DEV
      ? 'ws://localhost:9853'
      : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = async (e) => {
        const msg = JSON.parse(e.data);
        if (msg.type === 'update') {
          setRequests(msg.data);
          if (msg.data.length > 0) {
            const oldest = msg.data[msg.data.length - 1]?.timestamp_iso;
            if (oldest) {
              setFirstRequestTime(oldest);
            }
          }
          // Update statistics when new data arrives via WebSocket
          try {
            const queryParams = new URLSearchParams();
            appendFilterParams(queryParams, filters);

            const statsResponse = await fetch(`/api/statistics?${queryParams}`);
            const statsData = await statsResponse.json();
            setStats(statsData);
          } catch (error) {
            console.error('Failed to load statistics:', error);
          }
        }
      };

      ws.onerror = () => {
        // Silently handle WebSocket errors - server may not be running
      };

      ws.onclose = () => {
        // Connection closed - will attempt to reconnect on next mount if needed
      };
    } catch (_err) {
      // Silently handle WebSocket creation errors
    }

    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [filters]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const queryParams = new URLSearchParams();
        appendFilterParams(queryParams, filters);
        queryParams.append('limit', '5000');

        const response = await fetch(`/api/requests?${queryParams}`);
        const data = await response.json();
        setRequests(data);

        if (data.length > 0) {
          const oldest = data[data.length - 1]?.timestamp_iso;
          if (oldest) {
            setFirstRequestTime(oldest);
          }
        }

        // Also load statistics
        const statsQueryParams = new URLSearchParams();
        appendFilterParams(statsQueryParams, filters);

        const statsResponse = await fetch(`/api/statistics?${statsQueryParams}`);
        const statsData = await statsResponse.json();
        setStats(statsData);
      } catch (error) {
        console.error('Failed to load requests:', error);
      }
    };

    fetchData();
  }, [filters]);

  // Keep filters ref up to date
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Periodically update statistics when on traffic tab
  useEffect(() => {
    if (activeTab !== 'traffic') {
      return;
    }

    // Update statistics every 2 seconds
    const interval = setInterval(async () => {
      try {
        const queryParams = new URLSearchParams();
        appendFilterParams(queryParams, filtersRef.current);

        const statsResponse = await fetch(`/api/statistics?${queryParams}`);
        const statsData = await statsResponse.json();
        setStats(statsData);
      } catch (error) {
        console.error('Failed to load statistics:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeTab]);

  return {
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
    tourDismissed,
    prevTabRef,
    wsRef,
    loadRequests,
  };
}
