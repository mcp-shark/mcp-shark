import { colors } from '../../theme';
import ErrorDisplay from './ErrorDisplay.jsx';
import FindingsTable from './FindingsTable.jsx';
import ScannerEmptyState from './ScannerEmptyState.jsx';
import ScanningProgress from './ScanningProgress.jsx';
import SecuritySummary from './SecuritySummary.jsx';

export default function ScannerContent({
  error,
  scanning,
  findings,
  summary,
  selectedFinding,
  onSelectFinding,
  rules,
  loadSummary,
}) {
  const hasFindings = findings && findings.length > 0;
  const showEmpty = !error && !scanning && !hasFindings;

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
      <ErrorDisplay error={error} />
      <ScanningProgress scanning={scanning} />

      {showEmpty && <ScannerEmptyState />}

      {hasFindings && !scanning && (
        <>
          <SecuritySummary summary={summary} onRefresh={loadSummary} />
          <FindingsTable
            findings={findings}
            selectedFinding={selectedFinding}
            onSelectFinding={onSelectFinding}
            rules={rules}
          />
        </>
      )}
    </div>
  );
}
