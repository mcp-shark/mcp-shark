import { useState, useEffect, useRef } from 'react';

export function useSmartScan() {
  const [apiToken, setApiToken] = useState('');
  const [serverStatus, setServerStatus] = useState(null);
  const [mcpData, setMcpData] = useState(null);
  const [discoveredServers, setDiscoveredServers] = useState([]);
  const [selectedServers, setSelectedServers] = useState(new Set());
  const [loadingData, setLoadingData] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanResults, setScanResults] = useState([]);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [clearingCache, setClearingCache] = useState(false);
  const [allScans, setAllScans] = useState([]);
  const [loadingScans, setLoadingScans] = useState(false);
  const [selectedScan, setSelectedScan] = useState(null);
  const [loadingScanDetail, setLoadingScanDetail] = useState(false);
  const saveTokenTimeoutRef = useRef(null);

  useEffect(() => {
    checkServerStatus();
    loadStoredToken();
    const interval = setInterval(checkServerStatus, 2000);
    return () => {
      clearInterval(interval);
      if (saveTokenTimeoutRef.current) {
        clearTimeout(saveTokenTimeoutRef.current);
      }
    };
  }, []);

  const loadStoredToken = async () => {
    try {
      const response = await fetch('/api/smartscan/token');
      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          setApiToken(data.token);
        }
      }
    } catch (err) {
      console.debug('No stored token found');
    }
  };

  const saveToken = async (token) => {
    try {
      const response = await fetch('/api/smartscan/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) {
        console.error('Failed to save token');
      }
    } catch (err) {
      console.error('Error saving token:', err);
    }
  };

  const checkServerStatus = async () => {
    try {
      const res = await fetch('/api/composite/status');
      if (!res.ok) {
        throw new Error('Server not available');
      }
      const data = await res.json();
      setServerStatus(data);
    } catch (err) {
      setServerStatus({ running: false });
    }
  };

  const makeMcpRequest = async (method, params = {}) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (sessionId) {
        headers['Mcp-Session-Id'] = sessionId;
      }

      const response = await fetch('/api/playground/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({ method, params }),
      });

      const data = await response.json();

      const responseSessionId =
        response.headers.get('Mcp-Session-Id') ||
        response.headers.get('mcp-session-id') ||
        data._sessionId;
      if (responseSessionId && responseSessionId !== sessionId) {
        setSessionId(responseSessionId);
      }

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Request failed');
      }

      return data.result || data;
    } catch (err) {
      throw err;
    }
  };

  const discoverMcpData = async () => {
    setLoadingData(true);
    setError(null);
    setMcpData(null);
    setDiscoveredServers([]);

    try {
      const response = await fetch('/api/smartscan/discover');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to discover servers');
      }

      const data = await response.json();
      if (!data.success || !data.servers || data.servers.length === 0) {
        throw new Error(
          'No MCP servers found in config. Please configure servers in the Setup tab.'
        );
      }

      setDiscoveredServers(data.servers);

      if (data.servers.length > 0) {
        setSelectedServers(new Set(data.servers.map((s) => s.name)));

        try {
          const cachedResponse = await fetch('/api/smartscan/cached-results', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              servers: data.servers,
            }),
          });

          if (cachedResponse.ok) {
            const cachedData = await cachedResponse.json();
            if (cachedData.success && cachedData.results) {
              const validCachedResults = cachedData.results.filter((r) => r.success && r.cached);
              if (validCachedResults.length > 0) {
                setScanResults(validCachedResults);
              }
            }
          }
        } catch (err) {
          console.debug('Could not load cached results:', err);
        }
      }

      if (data.servers.length > 0) {
        const firstServer = data.servers[0];
        setMcpData({
          server: {
            name: firstServer.name,
            description: `Discovered from MCP config`,
          },
          tools: firstServer.tools || [],
          resources: firstServer.resources || [],
          prompts: firstServer.prompts || [],
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to discover MCP server data');
    } finally {
      setLoadingData(false);
    }
  };

  const runScan = async () => {
    if (!apiToken) {
      setError('Please enter your API token');
      return;
    }

    if (!discoveredServers || discoveredServers.length === 0) {
      setError('Please discover MCP servers first');
      return;
    }

    if (selectedServers.size === 0) {
      setError('Please select at least one server to scan');
      return;
    }

    setScanning(true);
    setError(null);
    setScanResult(null);
    setScanResults([]);

    const serversToScan = discoveredServers.filter((server) => selectedServers.has(server.name));

    try {
      const response = await fetch('/api/smartscan/scans/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiToken,
          servers: serversToScan,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data.error || data.message || `API error: ${response.status}`;

        if (response.status === 400 && data.details) {
          if (Array.isArray(data.details)) {
            errorMessage = `Validation failed: ${data.details
              .map((d) => {
                if (typeof d === 'string') return d;
                if (d.field && d.message) return `${d.field}: ${d.message}`;
                return JSON.stringify(d);
              })
              .join('; ')}`;
          } else if (typeof data.details === 'string') {
            errorMessage = data.details;
          }
        }

        setError(errorMessage);
        return;
      }

      if (data.results && Array.isArray(data.results)) {
        setScanResults(data.results);

        const firstSuccess = data.results.find((r) => r.success);
        if (firstSuccess) {
          setScanResult(firstSuccess.data);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to run scan');
    } finally {
      setScanning(false);
    }
  };

  return {
    apiToken,
    setApiToken,
    serverStatus,
    mcpData,
    discoveredServers,
    selectedServers,
    setSelectedServers,
    loadingData,
    scanning,
    scanResult,
    scanResults,
    error,
    saveToken,
    discoverMcpData,
    runScan,
    clearCache: async () => {
      setClearingCache(true);
      setError(null);
      try {
        const response = await fetch('/api/smartscan/cache/clear', {
          method: 'POST',
        });
        const data = await response.json();
        if (response.ok) {
          // Refresh discovered servers to clear cached results
          if (discoveredServers.length > 0) {
            await discoverMcpData();
          }
          return { success: true, message: data.message };
        } else {
          throw new Error(data.error || 'Failed to clear cache');
        }
      } catch (err) {
        setError(err.message || 'Failed to clear cache');
        return { success: false, error: err.message };
      } finally {
        setClearingCache(false);
      }
    },
    clearingCache,
    saveTokenTimeoutRef,
    allScans,
    loadingScans,
    loadAllScans: async () => {
      if (!apiToken) {
        setError('Please enter your API token');
        return;
      }
      setLoadingScans(true);
      setError(null);
      try {
        const response = await fetch(`/api/smartscan/scans?token=${encodeURIComponent(apiToken)}`, {
          method: 'GET',
        });
        const data = await response.json();
        if (response.ok) {
          setAllScans(data.scans || []);
        } else {
          setError(data.error || data.message || 'Failed to load scans');
        }
      } catch (err) {
        setError(err.message || 'Failed to load scans');
      } finally {
        setLoadingScans(false);
      }
    },
    selectedScan,
    setSelectedScan,
    loadingScanDetail,
    loadScanDetail: async (scanId) => {
      if (!apiToken) {
        setError('Please enter your API token');
        return;
      }
      if (!scanId) {
        setSelectedScan(null);
        return;
      }
      setLoadingScanDetail(true);
      setError(null);
      try {
        const response = await fetch(`/api/smartscan/scans/${scanId}`, {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          // API returns { result: {...} }, so unwrap it
          setSelectedScan(data.result || data);
        } else {
          setError(data.error || data.message || 'Failed to load scan details');
        }
      } catch (err) {
        setError(err.message || 'Failed to load scan details');
      } finally {
        setLoadingScanDetail(false);
      }
    },
  };
}
