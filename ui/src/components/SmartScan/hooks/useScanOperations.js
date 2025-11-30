import { useState } from 'react';

export function useScanOperations(apiToken, discoveredServers, selectedServers, setError) {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanResults, setScanResults] = useState([]);

  const runScan = async () => {
    if (!apiToken) {
      setError('Please enter your API token');
      return;
    }

    if (!discoveredServers || discoveredServers.length === 0) {
      setError('Please discover MCP servers first');
      return;
    }

    if (selectedServers.size === 0) {
      setError('Please select at least one server to scan');
      return;
    }

    setScanning(true);
    setError(null);
    setScanResult(null);
    setScanResults([]);

    const serversToScan = discoveredServers.filter((server) => selectedServers.has(server.name));

    try {
      const response = await fetch('/api/smartscan/scans/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiToken,
          servers: serversToScan,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data.error || data.message || `API error: ${response.status}`;

        if (response.status === 400 && data.details) {
          if (Array.isArray(data.details)) {
            errorMessage = `Validation failed: ${data.details
              .map((d) => {
                if (typeof d === 'string') return d;
                if (d.field && d.message) return `${d.field}: ${d.message}`;
                return JSON.stringify(d);
              })
              .join('; ')}`;
          } else if (typeof data.details === 'string') {
            errorMessage = data.details;
          }
        }

        setError(errorMessage);
        return;
      }

      if (data.results && Array.isArray(data.results)) {
        setScanResults(data.results);

        const firstSuccess = data.results.find((r) => r.success);
        if (firstSuccess) {
          setScanResult(firstSuccess.data);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to run scan');
    } finally {
      setScanning(false);
    }
  };

  return {
    scanning,
    scanResult,
    scanResults,
    runScan,
  };
}
