import { useState, useEffect } from 'react';

export function useConfigManagement() {
  const [detectedPaths, setDetectedPaths] = useState([]);
  const [detecting, setDetecting] = useState(true);
  const [backups, setBackups] = useState([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [viewingConfig, setViewingConfig] = useState(null);
  const [configContent, setConfigContent] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(false);

  const detectConfigPaths = async () => {
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
  };

  const loadBackups = async () => {
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
  };

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
    } catch (err) {
      setConfigContent(null);
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    detectConfigPaths();
    loadBackups();
  }, []);

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
  };
}
