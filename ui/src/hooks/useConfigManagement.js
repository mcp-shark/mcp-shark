import { useCallback, useEffect, useState } from 'react';

export function useConfigManagement() {
  const [detectedPaths, setDetectedPaths] = useState([]);
  const [detecting, setDetecting] = useState(true);
  const [backups, setBackups] = useState([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [viewingConfig, setViewingConfig] = useState(null);
  const [configContent, setConfigContent] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [viewingBackup, setViewingBackup] = useState(null);
  const [backupContent, setBackupContent] = useState(null);
  const [loadingBackup, setLoadingBackup] = useState(false);

  const detectConfigPaths = useCallback(async () => {
    setDetecting(true);
    try {
      const res = await fetch('/api/config/detect');
      const data = await res.json();
      setDetectedPaths(data.detected || []);
    } catch (err) {
      console.error('Failed to detect config paths:', err);
    } finally {
      setDetecting(false);
    }
  }, []);

  const loadBackups = useCallback(async () => {
    setLoadingBackups(true);
    try {
      const res = await fetch('/api/config/backups');
      const data = await res.json();
      setBackups(data.backups || []);
    } catch (err) {
      console.error('Failed to load backups:', err);
    } finally {
      setLoadingBackups(false);
    }
  }, []);

  const handleViewConfig = async (filePath) => {
    setLoadingConfig(true);
    setViewingConfig(filePath);
    try {
      const res = await fetch(`/api/config/read?filePath=${encodeURIComponent(filePath)}`);
      const data = await res.json();
      if (res.ok) {
        setConfigContent(data);
      } else {
        setConfigContent(null);
      }
    } catch (_err) {
      setConfigContent(null);
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleViewBackup = async (backupPath) => {
    setLoadingBackup(true);
    setViewingBackup(backupPath);
    try {
      const res = await fetch(
        `/api/config/backup/view?backupPath=${encodeURIComponent(backupPath)}`
      );
      const data = await res.json();
      if (res.ok) {
        setBackupContent(data);
      } else {
        setBackupContent(null);
      }
    } catch (_err) {
      setBackupContent(null);
    } finally {
      setLoadingBackup(false);
    }
  };

  const handleDeleteBackup = async (backupPath) => {
    try {
      const res = await fetch('/api/config/backup/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupPath }),
      });

      if (res.ok) {
        await loadBackups();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to delete backup:', err);
      return false;
    }
  };

  useEffect(() => {
    detectConfigPaths();
    loadBackups();
  }, [detectConfigPaths, loadBackups]);

  return {
    detectedPaths,
    detecting,
    detectConfigPaths,
    backups,
    loadingBackups,
    loadBackups,
    viewingConfig,
    configContent,
    loadingConfig,
    handleViewConfig,
    setViewingConfig,
    setConfigContent,
    viewingBackup,
    backupContent,
    loadingBackup,
    handleViewBackup,
    handleDeleteBackup,
    setViewingBackup,
    setBackupContent,
  };
}
