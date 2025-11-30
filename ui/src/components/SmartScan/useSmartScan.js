import { useState } from 'react';
import { useTokenManagement } from './hooks/useTokenManagement';
import { useServerStatus } from './hooks/useServerStatus';
import { useMcpDiscovery } from './hooks/useMcpDiscovery';
import { useScanOperations } from './hooks/useScanOperations';
import { useScanList } from './hooks/useScanList';
import { useCacheManagement } from './hooks/useCacheManagement';

export function useSmartScan() {
  const [error, setError] = useState(null);

  const { apiToken, setApiToken, saveToken, saveTokenTimeoutRef } = useTokenManagement();
  const { serverStatus } = useServerStatus();
  const {
    mcpData,
    discoveredServers,
    selectedServers,
    setSelectedServers,
    loadingData,
    discoverMcpData,
    makeMcpRequest,
  } = useMcpDiscovery(setError);
  const { scanning, scanResult, scanResults, runScan } = useScanOperations(
    apiToken,
    discoveredServers,
    selectedServers,
    setError
  );
  const {
    allScans,
    loadingScans,
    loadAllScans,
    selectedScan,
    setSelectedScan,
    loadingScanDetail,
    loadScanDetail,
  } = useScanList(apiToken, setError);
  const { clearingCache, clearCache } = useCacheManagement(
    discoveredServers,
    discoverMcpData,
    setError
  );

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
    clearCache,
    clearingCache,
    saveTokenTimeoutRef,
    allScans,
    loadingScans,
    loadAllScans,
    selectedScan,
    setSelectedScan,
    loadingScanDetail,
    loadScanDetail,
    makeMcpRequest,
  };
}
