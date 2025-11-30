import { useState } from 'react';

export function useScanList(apiToken, setError) {
  const [allScans, setAllScans] = useState([]);
  const [loadingScans, setLoadingScans] = useState(false);
  const [selectedScan, setSelectedScan] = useState(null);
  const [loadingScanDetail, setLoadingScanDetail] = useState(false);

  const loadAllScans = async () => {
    setLoadingScans(true);
    setError(null);
    try {
      // Only load from local cache
      console.log('Loading cached scans from local storage...');
      const cacheResponse = await fetch('/api/smartscan/scans?cache=true');
      const cacheData = await cacheResponse.json();
      console.log('Cache response:', {
        status: cacheResponse.status,
        ok: cacheResponse.ok,
        cacheData,
      });

      if (cacheResponse.ok) {
        const scans = cacheData.scans || [];
        console.log(`[useScanList] Loaded ${scans.length} cached scans from API`);
        console.log(`[useScanList] Full cacheData:`, cacheData);

        // Debug: Log first scan structure to see what we're receiving
        if (scans.length > 0) {
          console.log('[useScanList] First scan structure:', {
            keys: Object.keys(scans[0]),
            serverName: scans[0].serverName,
            server_name: scans[0].server_name,
            server: scans[0].server,
            fullScan: scans[0],
          });
        }

        // Transform cached scans to BatchResultsDisplay format
        const scanResults = scans.map((scan, index) => {
          // The scan structure from getAllCachedScanResults has:
          // { id, scan_id, server: { name }, serverName, server_name, data, result, ... }

          console.log(`[useScanList] Transforming scan ${index}:`, {
            scanId: scan.id || scan.scan_id,
            serverName: scan.serverName,
            server_name: scan.server_name,
            server: scan.server,
            hasServerName: !!scan.serverName,
            hasServerNameAlt: !!scan.server_name,
            hasServer: !!scan.server,
          });

          // Extract server name from multiple possible locations
          // Handle empty strings, null, undefined
          const serverName =
            (scan.serverName && scan.serverName.trim()) ||
            (scan.server_name && scan.server_name.trim()) ||
            (scan.server?.name && scan.server.name.trim()) ||
            'Unknown Server';

          console.log(`[useScanList] Extracted serverName for scan ${index}: "${serverName}"`);

          // Debug logging
          if (serverName === 'Unknown Server') {
            console.error('[useScanList] Could not find server name in scan:', {
              scanId: scan.id || scan.scan_id,
              hasServerName: !!scan.serverName,
              hasServerNameAlt: !!scan.server_name,
              hasServer: !!scan.server,
              serverNameValue: scan.serverName,
              serverNameAltValue: scan.server_name,
              serverNameFromServer: scan.server?.name,
              scanKeys: Object.keys(scan),
              fullScanObject: scan,
            });
          }

          // Get the actual scan data - it might be nested
          // scan.data could be the scan result from API which has { success, data, scan_id, ... }
          // or it could be the direct scan data
          let scanData = scan.data || scan.result || scan;

          // If scanData has a nested 'data' property (from API response), use that
          if (scanData && scanData.data && typeof scanData.data === 'object') {
            scanData = scanData.data;
          }

          const transformed = {
            serverName: serverName,
            success: true,
            cached: true,
            data: {
              scan_id: scan.scan_id || scan.id,
              data: scanData,
            },
          };

          console.log(`[useScanList] Transformed result ${index}:`, {
            serverName: transformed.serverName,
            scan_id: transformed.data.scan_id,
          });

          return transformed;
        });

        console.log(
          '[useScanList] Final transformed scanResults:',
          scanResults.map((r) => ({
            serverName: r.serverName,
            scan_id: r.data.scan_id,
          }))
        );

        console.log('[useScanList] Setting allScans state with:', scanResults.length, 'items');
        console.log('[useScanList] First item serverName:', scanResults[0]?.serverName);
        console.log('[useScanList] Second item serverName:', scanResults[1]?.serverName);

        setAllScans(scanResults);
        if (scanResults.length === 0) {
          setError('No cached scans found. Please run a scan first to see results here.');
        }
      } else {
        setError(cacheData.error || cacheData.message || 'Failed to load cached scans');
      }
    } catch (err) {
      setError(err.message || 'Failed to load cached scans');
    } finally {
      setLoadingScans(false);
    }
  };

  const loadScanDetail = async (scanId) => {
    if (!scanId) {
      setSelectedScan(null);
      return;
    }

    // First, check if we already have this scan in allScans (cached scan)
    // allScans is in BatchResultsDisplay format: { serverName, success, cached, data: { scan_id, data: {...} } }
    const cachedResult = allScans.find(
      (r) =>
        r.data?.scan_id === scanId ||
        r.data?.data?.id === scanId ||
        r.data?.data?.scan_id === scanId
    );
    if (cachedResult && cachedResult.cached && cachedResult.data?.data) {
      // Use the cached scan data directly
      const scanData = cachedResult.data.data;
      setSelectedScan({
        ...scanData,
        scan_id: cachedResult.data.scan_id || scanData.id || scanData.scan_id,
      });
      return;
    }

    // If not cached and no API token, can't load from API
    if (!apiToken) {
      setError('Please enter your API token to view scan details');
      return;
    }

    setLoadingScanDetail(true);
    setError(null);
    try {
      const response = await fetch(`/api/smartscan/scans/${scanId}`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setSelectedScan(data.result || data);
      } else {
        setError(data.error || data.message || 'Failed to load scan details');
      }
    } catch (err) {
      setError(err.message || 'Failed to load scan details');
    } finally {
      setLoadingScanDetail(false);
    }
  };

  return {
    allScans,
    loadingScans,
    loadAllScans,
    selectedScan,
    setSelectedScan,
    loadingScanDetail,
    loadScanDetail,
  };
}
