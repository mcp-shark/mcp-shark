import { useCallback, useEffect, useState } from 'react';
import {
  deleteRule,
  fetchCommunityRules,
  fetchEngineStatus,
  fetchFindings,
  fetchRuleSources,
  fetchRules,
  fetchSummary,
  patchRuleEnabled,
  postClearFindings,
  postCustomRule,
  postDiscoverAndScan,
  postInitializeSources,
  postSyncAllSources,
  postSyncSource,
} from './securityApi.js';

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

  const discoverAndScan = useCallback(async () => {
    setScanning(true);
    setError(null);
    try {
      const data = await postDiscoverAndScan();
      if (!data.success) {
        setError(data.error || 'Scan failed');
      } else {
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
      const data = await postClearFindings();
      if (data.success) {
        setFindings([]);
        setSummary(null);
        setSelectedFinding(null);
        await loadFindings();
        await loadSummary();
      }
    } catch (err) {
      console.error('Failed to clear findings:', err);
    } finally {
      setClearing(false);
    }
  }, [loadFindings, loadSummary]);

  const loadCommunityRules = useCallback(async () => {
    try {
      const data = await fetchCommunityRules();
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
      const data = await fetchRuleSources();
      if (data.success) {
        setRuleSources(data.sources);
      }
    } catch (err) {
      console.error('Failed to load rule sources:', err);
    }
  }, []);

  const loadEngineStatus = useCallback(async () => {
    try {
      const data = await fetchEngineStatus();
      if (data.success) {
        setEngineStatus(data);
      }
    } catch (err) {
      console.error('Failed to load engine status:', err);
    }
  }, []);

  const initializeSources = useCallback(async () => {
    try {
      const data = await postInitializeSources();
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
      const data = await postSyncAllSources();
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
        const data = await postSyncSource(sourceName);
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
        const data = await patchRuleEnabled(ruleId, enabled);
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

  const saveCustomRule = useCallback(
    async (ruleData) => {
      try {
        const data = await postCustomRule(ruleData);
        if (data.success) {
          await loadCommunityRules();
        }
        return data;
      } catch (err) {
        console.error('Failed to save custom rule:', err);
        return { success: false, error: err.message };
      }
    },
    [loadCommunityRules]
  );

  const deleteCustomRule = useCallback(
    async (ruleId) => {
      try {
        const data = await deleteRule(ruleId);
        if (data.success) {
          await loadCommunityRules();
        }
        return data;
      } catch (err) {
        console.error('Failed to delete custom rule:', err);
        return { success: false, error: err.message };
      }
    },
    [loadCommunityRules]
  );

  useEffect(() => {
    loadRules();
    loadFindings();
    loadSummary();
    loadRuleSources();
    loadEngineStatus();
  }, [loadRules, loadFindings, loadSummary, loadRuleSources, loadEngineStatus]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadFindings();
      loadSummary();
    }, 3000);
    return () => clearInterval(interval);
  }, [loadFindings, loadSummary]);

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
    saveCustomRule,
    deleteCustomRule,
  };
}
