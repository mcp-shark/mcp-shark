import { useState, useEffect } from 'react';

export function useMcpServerStatus() {
  const [serverStatus, setServerStatus] = useState(null);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [availableServers, setAvailableServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState(null);

  const checkServerStatus = async () => {
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
    } catch (err) {
      setServerStatus({ running: false });
      if (!showLoadingModal) {
        setShowLoadingModal(true);
      }
    }
  };

  const loadAvailableServers = async () => {
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
  };

  useEffect(() => {
    checkServerStatus();
    loadAvailableServers();
    const interval = setInterval(checkServerStatus, 2000);
    return () => clearInterval(interval);
  }, []);

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
