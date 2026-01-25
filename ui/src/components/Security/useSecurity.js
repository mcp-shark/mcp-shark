import { useCallback, useEffect, useState } from 'react';

export function useSecurity() {
  const [rules, setRules] = useState([]);
  const [findings, setFindings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [selectedFinding, setSelectedFinding] = useState(null);

  // Community rules state
  const [communityRules, setCommunityRules] = useState([]);
  const [ruleSources, setRuleSources] = useState([]);
  const [rulesSummary, setRulesSummary] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [engineStatus, setEngineStatus] = useState(null);

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
    setClearing(true);
    try {
      const response = await fetch('/api/security/findings/clear', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        setFindings([]);
        setSummary(null);
        setSelectedFinding(null);
        // Reload to confirm deletion
        await loadFindings();
        await loadSummary();
      }
    } catch (err) {
      console.error('Failed to clear findings:', err);
    } finally {
      setClearing(false);
    }
  }, [loadFindings, loadSummary]);

  // Community rules functions
  const loadCommunityRules = useCallback(async () => {
    try {
      const response = await fetch('/api/security/community-rules');
      const data = await response.json();
      if (data.success) {
        setCommunityRules(data.rules);
        setRulesSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to load community rules:', err);
    }
  }, []);

  const loadRuleSources = useCallback(async () => {
    try {
      const response = await fetch('/api/security/sources');
      const data = await response.json();
      if (data.success) {
        setRuleSources(data.sources);
      }
    } catch (err) {
      console.error('Failed to load rule sources:', err);
    }
  }, []);

  const loadEngineStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/security/engine/status');
      const data = await response.json();
      if (data.success) {
        setEngineStatus(data);
      }
    } catch (err) {
      console.error('Failed to load engine status:', err);
    }
  }, []);

  const initializeSources = useCallback(async () => {
    try {
      const response = await fetch('/api/security/sources/initialize', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        await loadRuleSources();
      }
      return data;
    } catch (err) {
      console.error('Failed to initialize sources:', err);
      return { success: false, error: err.message };
    }
  }, [loadRuleSources]);

  const syncAllSources = useCallback(async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/security/sources/sync', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        await loadCommunityRules();
        await loadRuleSources();
      }
      return data;
    } catch (err) {
      console.error('Failed to sync sources:', err);
      return { success: false, error: err.message };
    } finally {
      setSyncing(false);
    }
  }, [loadCommunityRules, loadRuleSources]);

  const syncSource = useCallback(
    async (sourceName) => {
      setSyncing(true);
      try {
        const response = await fetch(
          `/api/security/sources/${encodeURIComponent(sourceName)}/sync`,
          {
            method: 'POST',
          }
        );
        const data = await response.json();
        if (data.success) {
          await loadCommunityRules();
          await loadRuleSources();
        }
        return data;
      } catch (err) {
        console.error('Failed to sync source:', err);
        return { success: false, error: err.message };
      } finally {
        setSyncing(false);
      }
    },
    [loadCommunityRules, loadRuleSources]
  );

  const setRuleEnabled = useCallback(
    async (ruleId, enabled) => {
      try {
        const response = await fetch(
          `/api/security/community-rules/${encodeURIComponent(ruleId)}/enabled`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled }),
          }
        );
        const data = await response.json();
        if (data.success) {
          await loadCommunityRules();
        }
        return data;
      } catch (err) {
        console.error('Failed to set rule enabled:', err);
        return { success: false, error: err.message };
      }
    },
    [loadCommunityRules]
  );

  // Load initial data
  useEffect(() => {
    loadRules();
    loadFindings();
    loadSummary();
    loadRuleSources();
    loadEngineStatus();
  }, [loadRules, loadFindings, loadSummary, loadRuleSources, loadEngineStatus]);

  // Poll for new findings every 3 seconds (real-time traffic detection)
  useEffect(() => {
    const interval = setInterval(() => {
      loadFindings();
      loadSummary();
    }, 3000);

    return () => clearInterval(interval);
  }, [loadFindings, loadSummary]);

  // Note: loadFindings already depends on filters via useCallback

  return {
    // Static rules and findings
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

    // Community rules
    communityRules,
    ruleSources,
    rulesSummary,
    syncing,
    engineStatus,
    loadCommunityRules,
    loadRuleSources,
    initializeSources,
    syncAllSources,
    syncSource,
    setRuleEnabled,
  };
}
