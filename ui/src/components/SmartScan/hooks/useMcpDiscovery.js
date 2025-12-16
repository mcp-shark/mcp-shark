import { useState } from 'react';

export function useMcpDiscovery(setError) {
  const [mcpData, setMcpData] = useState(null);
  const [discoveredServers, setDiscoveredServers] = useState([]);
  const [selectedServers, setSelectedServers] = useState(new Set());
  const [loadingData, setLoadingData] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const makeMcpRequest = async (method, params = {}) => {
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
                // This will be handled by the parent component
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
            description: 'Discovered from MCP config',
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

  return {
    mcpData,
    discoveredServers,
    selectedServers,
    setSelectedServers,
    loadingData,
    discoverMcpData,
    makeMcpRequest,
  };
}
