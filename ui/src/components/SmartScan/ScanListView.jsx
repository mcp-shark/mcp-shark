import { colors, fonts } from '../../theme';
import ScanListHeader from './ScanListView/ScanListHeader';
import ScanListItem from './ScanListView/ScanListItem';

export default function ScanListView({ scans, loading, onRefresh, onSelectScan }) {
  if (loading) {
    return (
      <div
        style={{
          background: colors.bgCard,
          border: `1px solid ${colors.borderLight}`,
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <p style={{ color: colors.textSecondary, fontFamily: fonts.body }}>Loading scans...</p>
      </div>
    );
  }

  if (!scans || scans.length === 0) {
    return (
      <div
        style={{
          background: colors.bgCard,
          border: `1px solid ${colors.borderLight}`,
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <p style={{ color: colors.textSecondary, fontFamily: fonts.body }}>
          No scans found. Run a scan to see results here.
        </p>
      </div>
    );
  }

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
      <ScanListHeader scanCount={scans.length} loading={loading} onRefresh={onRefresh} />
      <div
        style={{
          padding: '8px 12px',
          background: colors.bgSecondary,
          border: `1px solid ${colors.borderLight}`,
          borderRadius: '6px',
          marginBottom: '16px',
          fontSize: '11px',
          color: colors.textSecondary,
          fontFamily: fonts.body,
          fontStyle: 'italic',
        }}
      >
        ℹ️ These results are from local cache. Run a new scan to see the latest results.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {scans.map((scan) => (
          <ScanListItem key={scan.id} scan={scan} onSelectScan={onSelectScan} />
        ))}
      </div>
    </div>
  );
}
