import { useCallback, useState } from 'react';

export function useMcpRequest(selectedServer) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  const makeMcpRequest = useCallback(
    async (method, params = {}) => {
      if (!selectedServer) {
        throw new Error('No server selected');
      }

      setError(null);
      setLoading(true);

      try {
        const headers = { 'Content-Type': 'application/json' };
        if (sessionId) {
          headers['Mcp-Session-Id'] = sessionId;
        }

        const response = await fetch('/api/playground/proxy', {
          method: 'POST',
          headers,
          body: JSON.stringify({ method, params, serverName: selectedServer }),
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
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedServer, sessionId]
  );

  const resetSession = useCallback(() => {
    setSessionId(null);
  }, []);

  return {
    makeMcpRequest,
    loading,
    error,
    setError,
    resetSession,
  };
}
