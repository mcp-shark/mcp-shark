import { useCallback, useEffect, useState } from 'react';
import {
  fetchFindings,
  fetchRules,
  fetchRunningServersCount,
  fetchScanHistory,
  fetchSummary,
  postAnalyseRunningServers,
  postClearFindings,
} from './securityApi.js';
import { useYaraRules } from './useYaraRules.js';

export function useSecurity() {
  const [rules, setRules] = useState([]);
  const [findings, setFindings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [selectedFinding, setSelectedFinding] = useState(null);

  // Scan history state
  const [scanHistory, setScanHistory] = useState([]);
  const [selectedScanId, setSelectedScanId] = useState(null);

  // Running servers state
  const [runningServersCount, setRunningServersCount] = useState(0);

  // Track whether a scan has been completed (to show appropriate empty state)
  const [scanComplete, setScanComplete] = useState(false);

  // Use YARA rules hook
  const yaraRules = useYaraRules();

  const loadRules = useCallback(async () => {
    try {
      const data = await fetchRules();
      if (data.success) {
        setRules(data.rules);
      }
    } catch (err) {
      console.error('Failed to load rules:', err);
    }
  }, []);

  const loadFindings = useCallback(async () => {
    try {
      const data = await fetchFindings(filters);
      if (data.success) {
        setFindings(data.findings);
      }
    } catch (err) {
      console.error('Failed to load findings:', err);
    }
  }, [filters]);

  const loadSummary = useCallback(async () => {
    try {
      const data = await fetchSummary();
      if (data.success) {
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to load summary:', err);
    }
  }, []);

  const loadScanHistory = useCallback(async () => {
    try {
      const data = await fetchScanHistory();
      if (data.success) {
        setScanHistory(data.history);
      }
    } catch (err) {
      console.error('Failed to load scan history:', err);
    }
  }, []);

  const checkRunningServers = useCallback(async () => {
    try {
      const data = await fetchRunningServersCount();
      if (data.success) {
        setRunningServersCount(data.count);
      }
    } catch (err) {
      console.error('Failed to check running servers:', err);
    }
  }, []);

  const discoverAndScan = useCallback(async () => {
    setScanning(true);
    setError(null);
    setFindings([]); // Clear findings before scan
    setSummary(null);
    setSelectedScanId(null); // Clear history selection for new scan
    setScanComplete(false);
    try {
      const data = await postAnalyseRunningServers();
      if (!data.success) {
        // Return special error with requiresSetup flag
        const errorInfo = {
          message: data.error || 'Analysis failed',
          requiresSetup: data.requiresSetup || false,
        };
        setError(errorInfo);
      } else {
        await loadFindings();
        await loadSummary();
        await loadScanHistory(); // Refresh history
        setScanComplete(true); // Mark scan as complete
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError({ message: err.message, requiresSetup: false });
    } finally {
      setScanning(false);
    }
  }, [loadFindings, loadSummary, loadScanHistory]);

  const clearFindings = useCallback(async () => {
    setClearing(true);
    try {
      const data = await postClearFindings();
      if (data.success) {
        setFindings([]);
        setSummary(null);
        setSelectedFinding(null);
        setSelectedScanId(null);
        setError(null);
        setScanComplete(false); // Reset scan complete state
        await loadScanHistory(); // Refresh history after clear
      }
    } catch (err) {
      console.error('Failed to clear findings:', err);
    } finally {
      setClearing(false);
    }
  }, [loadScanHistory]);

  const selectHistoricalScan = useCallback(async (scanId) => {
    setSelectedScanId(scanId);
    setError(null);
    try {
      // Fetch findings filtered by scan_id
      const params = new URLSearchParams();
      params.append('scan_id', scanId);
      params.append('limit', '100');
      const response = await fetch(`/api/security/findings?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setFindings(data.findings);
      }
    } catch (err) {
      console.error('Failed to load historical findings:', err);
    }
  }, []);

  useEffect(() => {
    loadRules();
    loadScanHistory();
    checkRunningServers();
  }, [loadRules, loadScanHistory, checkRunningServers]);

  return {
    rules,
    findings,
    summary,
    scanning,
    clearing,
    error,
    discoverAndScan,
    clearFindings,
    loadFindings,
    loadSummary,
    filters,
    setFilters,
    selectedFinding,
    setSelectedFinding,
    scanHistory,
    selectedScanId,
    selectHistoricalScan,
    runningServersCount,
    checkRunningServers,
    scanComplete,
    // YARA rules (spread from useYaraRules)
    ...yaraRules,
  };
}
