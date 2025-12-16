import { colors, fonts } from '../../theme';

export default function ViewModeTabs({ viewMode, setViewMode, onSwitchToScan, onSwitchToList }) {
  return (
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
        type="button"
        onClick={() => {
          setViewMode('scan');
          onSwitchToScan?.();
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
        type="button"
        onClick={() => {
          setViewMode('list');
          onSwitchToList?.();
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
  );
}
