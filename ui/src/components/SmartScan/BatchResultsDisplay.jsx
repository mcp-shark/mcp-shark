import { colors } from '../../theme';
import BatchResultsHeader from './BatchResultsDisplay/BatchResultsHeader';
import BatchResultItem from './BatchResultsDisplay/BatchResultItem';

export default function BatchResultsDisplay({ scanResults, onViewScan }) {
  if (scanResults.length === 0) return null;

  return (
    <div
      style={{
        background: colors.bgCard,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: '8px',
        padding: '20px',
        boxShadow: `0 1px 3px ${colors.shadowSm}`,
      }}
    >
      <BatchResultsHeader scanResults={scanResults} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {scanResults.map((result, idx) => (
          <BatchResultItem key={idx} result={result} onViewScan={onViewScan} />
        ))}
      </div>
    </div>
  );
}
