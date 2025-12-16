import { colors } from '../../theme';
import ScanDetailView from './ScanDetailView';
import ScanResultsDisplay from './ScanResultsDisplay';
import ServerSelectionRow from './ServerSelectionRow';

export default function ScanViewContent({
  discoveredServers,
  selectedServers,
  setSelectedServers,
  runScan,
  scanning,
  apiToken,
  error,
  scanResults,
  scanResult,
  selectedScan,
  loadingScanDetail,
  setSelectedScan,
  loadScanDetail,
  onViewScan,
}) {
  if (selectedScan) {
    return (
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
    );
  }

  return (
    <>
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

      <ScanResultsDisplay
        error={error}
        scanning={scanning}
        selectedServers={selectedServers}
        scanResults={scanResults}
        scanResult={scanResult}
        onViewScan={onViewScan}
      />
    </>
  );
}
