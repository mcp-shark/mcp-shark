import { useCallback, useEffect, useState } from 'react';

export function useMcpServerStatus() {
  const [serverStatus, setServerStatus] = useState(null);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [availableServers, setAvailableServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState(null);

  const checkServerStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/composite/status');
      if (!res.ok) {
        throw new Error('Server not available');
      }
      const data = await res.json();
      const wasRunning = serverStatus?.running;
      setServerStatus(data);

      if (!data.running) {
        if (!showLoadingModal || wasRunning) {
          setShowLoadingModal(true);
        }
      } else if (data.running && showLoadingModal) {
        setShowLoadingModal(false);
      }
    } catch (_err) {
      setServerStatus({ running: false });
      if (!showLoadingModal) {
        setShowLoadingModal(true);
      }
    }
  }, [serverStatus, showLoadingModal]);

  const loadAvailableServers = useCallback(async () => {
    try {
      const res = await fetch('/api/composite/servers');
      if (res.ok) {
        const data = await res.json();
        setAvailableServers(data.servers || []);
        if (data.servers && data.servers.length > 0 && !selectedServer) {
          setSelectedServer(data.servers[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load servers:', err);
    }
  }, [selectedServer]);

  useEffect(() => {
    checkServerStatus();
    loadAvailableServers();
    const interval = setInterval(checkServerStatus, 2000);
    return () => clearInterval(interval);
  }, [checkServerStatus, loadAvailableServers]);

  useEffect(() => {
    if (availableServers.length > 0 && !selectedServer) {
      setSelectedServer(availableServers[0]);
    }
  }, [availableServers, selectedServer]);

  return {
    serverStatus,
    showLoadingModal,
    availableServers,
    selectedServer,
    setSelectedServer,
    checkServerStatus,
  };
}
