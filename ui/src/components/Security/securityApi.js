/**
 * Security API functions
 * Centralized API calls for security features
 */

export async function fetchRules() {
  const response = await fetch('/api/security/rules');
  return response.json();
}

export async function fetchFindings(filters) {
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
  return response.json();
}

export async function fetchSummary() {
  const response = await fetch('/api/security/summary');
  return response.json();
}

export async function fetchScanHistory(limit = 20) {
  const response = await fetch(`/api/security/history?limit=${limit}`);
  return response.json();
}

export async function postDiscoverAndScan() {
  const response = await fetch('/api/security/scan/discover', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return response.json();
}

export async function postAnalyseRunningServers() {
  const response = await fetch('/api/security/analyse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return response.json();
}

export async function fetchRunningServersCount() {
  const response = await fetch('/api/server/connected');
  return response.json();
}

export async function postClearFindings() {
  const response = await fetch('/api/security/findings/clear', {
    method: 'POST',
  });
  return response.json();
}

export async function fetchCommunityRules() {
  const response = await fetch('/api/security/community-rules');
  return response.json();
}

export async function fetchRuleSources() {
  const response = await fetch('/api/security/sources');
  return response.json();
}

export async function fetchEngineStatus() {
  const response = await fetch('/api/security/engine/status');
  return response.json();
}

export async function postInitializeSources() {
  const response = await fetch('/api/security/sources/initialize', {
    method: 'POST',
  });
  return response.json();
}

export async function postSyncAllSources() {
  const response = await fetch('/api/security/sources/sync', {
    method: 'POST',
  });
  return response.json();
}

export async function postSyncSource(sourceName) {
  const response = await fetch(`/api/security/sources/${encodeURIComponent(sourceName)}/sync`, {
    method: 'POST',
  });
  return response.json();
}

export async function patchRuleEnabled(ruleId, enabled) {
  const response = await fetch(
    `/api/security/community-rules/${encodeURIComponent(ruleId)}/enabled`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    }
  );
  return response.json();
}

export async function postCustomRule(ruleData) {
  const response = await fetch('/api/security/community-rules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ruleData),
  });
  return response.json();
}

export async function deleteRule(ruleId) {
  const response = await fetch(`/api/security/community-rules/${encodeURIComponent(ruleId)}`, {
    method: 'DELETE',
  });
  return response.json();
}

export async function postResetDefaults() {
  const response = await fetch('/api/security/yara/reset-defaults', {
    method: 'POST',
  });
  return response.json();
}

export async function patchRule(ruleId, ruleData) {
  const response = await fetch(`/api/security/community-rules/${encodeURIComponent(ruleId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ruleData),
  });
  return response.json();
}
