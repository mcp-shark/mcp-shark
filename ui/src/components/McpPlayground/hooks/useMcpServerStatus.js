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
      setServerStatus((prevStatus) => {
        const wasRunning = prevStatus?.running;
        if (!data.running) {
          setShowLoadingModal((prevModal) => {
            if (!prevModal || wasRunning) {
              return true;
            }
            return prevModal;
          });
        } else {
          setShowLoadingModal((prevModal) => {
            if (prevModal) {
              return false;
            }
            return prevModal;
          });
        }
        return data;
      });
    } catch (_err) {
      setServerStatus({ running: false });
      setShowLoadingModal((prevModal) => {
        if (!prevModal) {
          return true;
        }
        return prevModal;
      });
    }
  }, []);

  const loadAvailableServers = useCallback(async () => {
    try {
      const res = await fetch('/api/composite/servers');
      if (res.ok) {
        const data = await res.json();
        setAvailableServers(data.servers || []);
        setSelectedServer((current) => {
          if (!current && data.servers && data.servers.length > 0) {
            return data.servers[0];
          }
          return current;
        });
      }
    } catch (err) {
      console.error('Failed to load servers:', err);
    }
  }, []);

  // Load servers once on mount
  useEffect(() => {
    loadAvailableServers();
  }, [loadAvailableServers]);

  // Poll server status every 2 seconds
  useEffect(() => {
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 2000);
    return () => clearInterval(interval);
  }, [checkServerStatus]);

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
