import { useState } from 'react';
import ListViewContent from './components/SmartScan/ListViewContent';
import ScanViewContent from './components/SmartScan/ScanViewContent';
import SmartScanControls from './components/SmartScan/SmartScanControls';
import SmartScanHeader from './components/SmartScan/SmartScanHeader';
import ViewModeTabs from './components/SmartScan/ViewModeTabs';
import { useSmartScan } from './components/SmartScan/useSmartScan';
import { colors } from './theme';

function SmartScan() {
  const [viewMode, setViewMode] = useState('scan'); // 'scan' or 'list'
  const {
    apiToken,
    setApiToken,
    discoveredServers,
    selectedServers,
    setSelectedServers,
    loadingData,
    scanning,
    scanResult,
    scanResults,
    error,
    saveToken,
    discoverMcpData,
    runScan,
    clearCache,
    clearingCache,
    allScans,
    loadingScans,
    loadAllScans,
    selectedScan,
    setSelectedScan,
    loadingScanDetail,
    loadScanDetail,
  } = useSmartScan();

  return (
    <div
      data-tab-content
      style={{
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: colors.bgPrimary,
      }}
    >
      {/* Top Bar - Controls */}
      <div
        style={{
          background: colors.bgCard,
          borderBottom: `1px solid ${colors.borderLight}`,
          padding: '16px 24px',
          boxShadow: `0 2px 4px ${colors.shadowSm}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            flexWrap: 'wrap',
          }}
        >
          <SmartScanHeader />
          <ViewModeTabs
            viewMode={viewMode}
            setViewMode={setViewMode}
            onSwitchToScan={() => setSelectedScan(null)}
            onSwitchToList={() => {
              setSelectedScan(null);
              if (allScans.length === 0) {
                loadAllScans();
              }
            }}
          />
          {viewMode === 'scan' && (
            <SmartScanControls
              apiToken={apiToken}
              setApiToken={setApiToken}
              saveToken={saveToken}
              loadingData={loadingData}
              discoverMcpData={discoverMcpData}
              discoveredServers={discoveredServers}
              selectedServers={selectedServers}
              setSelectedServers={setSelectedServers}
              runScan={runScan}
              scanning={scanning}
              clearCache={clearCache}
              clearingCache={clearingCache}
            />
          )}
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'scan' ? (
        <ScanViewContent
          discoveredServers={discoveredServers}
          selectedServers={selectedServers}
          setSelectedServers={setSelectedServers}
          runScan={runScan}
          scanning={scanning}
          apiToken={apiToken}
          error={error}
          scanResults={scanResults}
          scanResult={scanResult}
          selectedScan={selectedScan}
          loadingScanDetail={loadingScanDetail}
          setSelectedScan={setSelectedScan}
          loadScanDetail={loadScanDetail}
          onViewScan={(scanData) => {
            console.log('onViewScan - scanData:', scanData);
            if (scanData.scan_id && apiToken) {
              loadScanDetail(scanData.scan_id);
            } else if (scanData.data && typeof scanData.data === 'object') {
              const actualScan = scanData.data;
              setSelectedScan({
                ...actualScan,
                scan_id: scanData.scan_id || actualScan.id || actualScan.scan_id,
              });
            } else {
              setSelectedScan(scanData);
            }
          }}
        />
      ) : (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '24px',
            background: colors.bgPrimary,
          }}
        >
          <ListViewContent
            error={error}
            loadingScans={loadingScans}
            selectedScan={selectedScan}
            loadingScanDetail={loadingScanDetail}
            allScans={allScans}
            setSelectedScan={setSelectedScan}
            loadScanDetail={loadScanDetail}
            onViewScan={(scanData) => {
              console.log('onViewScan - scanData:', scanData);
              const scanId = scanData.scan_id || scanData.id || scanData.hash;
              const matchingScan = allScans.find(
                (s) => s.data?.scan_id === scanId || s.data?.data?.scan_id === scanId
              );
              const serverName =
                matchingScan?.serverName || scanData.serverName || 'Unknown Server';

              if (scanData?.data && typeof scanData.data === 'object') {
                const actualScan = scanData.data;
                setSelectedScan({
                  ...actualScan,
                  scan_id: scanId || actualScan.id || actualScan.scan_id || actualScan.hash,
                  serverName: serverName,
                });
              } else if (scanData && typeof scanData === 'object') {
                setSelectedScan({
                  ...scanData,
                  scan_id: scanId || scanData.id || scanData.hash,
                  serverName: serverName,
                });
              } else {
                console.warn('Invalid scanData structure:', scanData);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}

export default SmartScan;
