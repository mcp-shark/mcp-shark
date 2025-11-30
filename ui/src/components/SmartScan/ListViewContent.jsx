import { colors, fonts } from '../../theme';
import ScanResultsDisplay from './ScanResultsDisplay';
import ScanDetailView from './ScanDetailView';

export default function ListViewContent({
  error,
  loadingScans,
  selectedScan,
  loadingScanDetail,
  allScans,
  setSelectedScan,
  loadScanDetail,
  onViewScan,
}) {
  if (loadingScans) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: colors.bgPrimary,
        }}
      >
        <p style={{ color: colors.textSecondary, fontFamily: fonts.body }}>
          Loading cached scans...
        </p>
      </div>
    );
  }

  if (selectedScan) {
    return (
      <ScanDetailView
        scan={selectedScan}
        loading={loadingScanDetail}
        onClose={() => {
          setSelectedScan(null);
          loadScanDetail(null);
        }}
      />
    );
  }

  return (
    <>
      {error && (
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
      <ScanResultsDisplay
        error={error}
        scanning={false}
        selectedServers={[]}
        scanResults={allScans}
        scanResult={null}
        onViewScan={onViewScan}
      />
    </>
  );
}
