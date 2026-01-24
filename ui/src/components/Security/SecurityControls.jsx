import { IconLoader2, IconRefresh, IconSearch, IconTrash } from '@tabler/icons-react';
import { colors, fonts } from '../../theme';

function SecurityControls({ onScan, scanning, onClear, onRefresh }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
      <button
        type="button"
        onClick={onScan}
        disabled={scanning}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: scanning ? colors.bgSecondary : colors.accent,
          color: scanning ? colors.textSecondary : '#fff',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          fontFamily: fonts.body,
          fontWeight: '500',
          cursor: scanning ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        {scanning ? <IconLoader2 size={16} className="spin" /> : <IconSearch size={16} />}
        {scanning ? 'Scanning...' : 'Discover & Scan'}
      </button>

      <button
        type="button"
        onClick={onRefresh}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 12px',
          background: colors.bgSecondary,
          color: colors.textPrimary,
          border: `1px solid ${colors.borderLight}`,
          borderRadius: '6px',
          fontSize: '14px',
          fontFamily: fonts.body,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <IconRefresh size={16} />
        Refresh
      </button>

      <button
        type="button"
        onClick={onClear}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 12px',
          background: colors.bgSecondary,
          color: colors.error,
          border: `1px solid ${colors.borderLight}`,
          borderRadius: '6px',
          fontSize: '14px',
          fontFamily: fonts.body,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <IconTrash size={16} />
        Clear
      </button>
    </div>
  );
}

export default SecurityControls;
