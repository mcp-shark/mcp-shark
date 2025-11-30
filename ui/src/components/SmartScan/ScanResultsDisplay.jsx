import { colors } from '../../theme';
import EmptyState from './EmptyState';
import ErrorDisplay from './ErrorDisplay';
import ScanningProgress from './ScanningProgress';
import BatchResultsDisplay from './BatchResultsDisplay';
import SingleResultDisplay from './SingleResultDisplay';

export default function ScanResultsDisplay({
  error,
  scanning,
  selectedServers,
  scanResults,
  scanResult,
  onViewScan,
}) {
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
      {!error && scanResults.length === 0 && !scanResult && !scanning && <EmptyState />}
      <ErrorDisplay error={error} />
      <ScanningProgress scanning={scanning} selectedServers={selectedServers} />
      {scanResults.length > 0 && (
        <BatchResultsDisplay scanResults={scanResults} onViewScan={onViewScan} />
      )}
      {scanResult && scanResults.length === 0 && <SingleResultDisplay scanResult={scanResult} />}
    </div>
  );
}
