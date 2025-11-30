import { useState } from 'react';
import { colors, fonts } from './theme';
import SmartScanHeader from './components/SmartScan/SmartScanHeader';
import SmartScanControls from './components/SmartScan/SmartScanControls';
import ServerSelectionRow from './components/SmartScan/ServerSelectionRow';
import ScanResultsDisplay from './components/SmartScan/ScanResultsDisplay';
import ScanListView from './components/SmartScan/ScanListView';
import ScanDetailView from './components/SmartScan/ScanDetailView';
import { useSmartScan } from './components/SmartScan/useSmartScan';

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
          <div
            style={{
              display: 'flex',
              gap: '8px',
              border: `1px solid ${colors.borderLight}`,
              borderRadius: '8px',
              padding: '4px',
              background: colors.bgSecondary,
            }}
          >
            <button
              onClick={() => {
                setViewMode('scan');
                setSelectedScan(null);
              }}
              style={{
                padding: '6px 14px',
                background: viewMode === 'scan' ? colors.bgCard : 'transparent',
                border: 'none',
                color: viewMode === 'scan' ? colors.textPrimary : colors.textSecondary,
                borderRadius: '6px',
                fontSize: '12px',
                fontFamily: fonts.body,
                fontWeight: viewMode === 'scan' ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Scan Servers
            </button>
            <button
              onClick={() => {
                setViewMode('list');
                setSelectedScan(null);
                if (apiToken && allScans.length === 0) {
                  loadAllScans();
                }
              }}
              style={{
                padding: '6px 14px',
                background: viewMode === 'list' ? colors.bgCard : 'transparent',
                border: 'none',
                color: viewMode === 'list' ? colors.textPrimary : colors.textSecondary,
                borderRadius: '6px',
                fontSize: '12px',
                fontFamily: fonts.body,
                fontWeight: viewMode === 'list' ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              View All Scans
            </button>
          </div>
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
        <>
          {/* Discovered Servers Selection Row */}
          {discoveredServers.length > 0 && (
            <ServerSelectionRow
              discoveredServers={discoveredServers}
              selectedServers={selectedServers}
              setSelectedServers={setSelectedServers}
              runScan={runScan}
              scanning={scanning}
              apiToken={apiToken}
            />
          )}

          {/* Results Display */}
          {selectedScan ? (
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '24px',
                background: colors.bgPrimary,
              }}
            >
              <ScanDetailView
                scan={selectedScan}
                loading={loadingScanDetail}
                onClose={() => {
                  setSelectedScan(null);
                  loadScanDetail(null);
                }}
              />
            </div>
          ) : (
            <ScanResultsDisplay
              error={error}
              scanning={scanning}
              selectedServers={selectedServers}
              scanResults={scanResults}
              scanResult={scanResult}
              onViewScan={(scanData) => {
                // scanData is result.data from BatchResultsDisplay
                // Structure from API: { scan_id, data: { id, analysis_result, overall_risk_level, ... } }
                // Or from cache: { scan_id, data: { ...scan data... }, cached: true }
                console.log('onViewScan - scanData:', scanData);

                // If scan_id exists and we have an API token, fetch full details from API
                if (scanData.scan_id && apiToken) {
                  loadScanDetail(scanData.scan_id);
                } else if (scanData.data && typeof scanData.data === 'object') {
                  // Use the nested data if available (from batch scan results)
                  // The actual scan is in scanData.data
                  const actualScan = scanData.data;
                  setSelectedScan({
                    ...actualScan,
                    scan_id: scanData.scan_id || actualScan.id || actualScan.scan_id,
                  });
                } else {
                  // Use the scan data directly (might already be the scan object)
                  setSelectedScan(scanData);
                }
              }}
            />
          )}
        </>
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
          {error && viewMode === 'list' && (
            <div
              style={{
                padding: '12px 16px',
                background: colors.error + '20',
                border: `1px solid ${colors.error}`,
                borderRadius: '8px',
                marginBottom: '16px',
                color: colors.error,
                fontSize: '13px',
                fontFamily: fonts.body,
              }}
            >
              {error}
            </div>
          )}
          {selectedScan ? (
            <ScanDetailView
              scan={selectedScan}
              loading={loadingScanDetail}
              onClose={() => {
                setSelectedScan(null);
                loadScanDetail(null);
              }}
            />
          ) : (
            <ScanListView
              scans={allScans}
              loading={loadingScans}
              onRefresh={loadAllScans}
              onSelectScan={(scanId) => {
                loadScanDetail(scanId);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default SmartScan;
