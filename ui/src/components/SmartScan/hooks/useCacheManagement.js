import { useState } from 'react';

export function useCacheManagement(discoveredServers, discoverMcpData, setError) {
  const [clearingCache, setClearingCache] = useState(false);

  const clearCache = async () => {
    setClearingCache(true);
    setError(null);
    try {
      const response = await fetch('/api/smartscan/cache/clear', {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok) {
        if (discoveredServers.length > 0) {
          await discoverMcpData();
        }
        return { success: true, message: data.message };
      }
      throw new Error(data.error || 'Failed to clear cache');
    } catch (err) {
      setError(err.message || 'Failed to clear cache');
      return { success: false, error: err.message };
    } finally {
      setClearingCache(false);
    }
  };

  return {
    clearingCache,
    clearCache,
  };
}
