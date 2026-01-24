import { useCallback, useEffect, useState } from 'react';

export function useSecurity() {
  const [rules, setRules] = useState([]);
  const [findings, setFindings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [selectedFinding, setSelectedFinding] = useState(null);

  const loadRules = useCallback(async () => {
    try {
      const response = await fetch('/api/security/rules');
      const data = await response.json();
      if (data.success) {
        setRules(data.rules);
      }
    } catch (err) {
      console.error('Failed to load rules:', err);
    }
  }, []);

  const loadFindings = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.severity) {
        params.append('severity', filters.severity);
      }
      if (filters.owasp_id) {
        params.append('owasp_id', filters.owasp_id);
      }
      if (filters.server_name) {
        params.append('server_name', filters.server_name);
      }
      if (filters.finding_type) {
        params.append('finding_type', filters.finding_type);
      }
      params.append('limit', '100');

      const response = await fetch(`/api/security/findings?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setFindings(data.findings);
      }
    } catch (err) {
      console.error('Failed to load findings:', err);
    }
  }, [filters]);

  const loadSummary = useCallback(async () => {
    try {
      const response = await fetch('/api/security/summary');
      const data = await response.json();
      if (data.success) {
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to load summary:', err);
    }
  }, []);

  const discoverAndScan = useCallback(async () => {
    setScanning(true);
    setError(null);
    try {
      const response = await fetch('/api/security/scan/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.error || 'Scan failed');
      } else {
        // Reload findings and summary after scan
        await loadFindings();
        await loadSummary();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  }, [loadFindings, loadSummary]);

  const clearFindings = useCallback(async () => {
    try {
      const response = await fetch('/api/security/findings/clear', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        setFindings([]);
        await loadSummary();
      }
    } catch (err) {
      console.error('Failed to clear findings:', err);
    }
  }, [loadSummary]);

  // Load initial data
  useEffect(() => {
    loadRules();
    loadFindings();
    loadSummary();
  }, [loadRules, loadFindings, loadSummary]);

  // Note: loadFindings already depends on filters via useCallback

  return {
    rules,
    findings,
    summary,
    scanning,
    error,
    discoverAndScan,
    clearFindings,
    loadFindings,
    loadSummary,
    filters,
    setFilters,
    selectedFinding,
    setSelectedFinding,
  };
}
