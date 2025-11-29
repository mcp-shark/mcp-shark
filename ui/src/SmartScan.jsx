import { colors } from './theme';
import SmartScanHeader from './components/SmartScan/SmartScanHeader';
import SmartScanControls from './components/SmartScan/SmartScanControls';
import ServerSelectionRow from './components/SmartScan/ServerSelectionRow';
import ScanResultsDisplay from './components/SmartScan/ScanResultsDisplay';
import { useSmartScan } from './components/SmartScan/useSmartScan';

function SmartScan() {
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
          />
        </div>
      </div>

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
      <ScanResultsDisplay
        error={error}
        scanning={scanning}
        selectedServers={selectedServers}
        scanResults={scanResults}
        scanResult={scanResult}
      />
    </div>
  );
}

export default SmartScan;
