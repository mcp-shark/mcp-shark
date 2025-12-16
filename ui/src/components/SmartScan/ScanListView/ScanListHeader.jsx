import { IconRefresh } from '@tabler/icons-react';
import { colors, fonts } from '../../../theme';

export default function ScanListHeader({ scanCount, loading, onRefresh }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}
    >
      <h2
        style={{
          fontSize: '14px',
          fontWeight: '600',
          color: colors.textPrimary,
          fontFamily: fonts.body,
          margin: 0,
        }}
      >
        All Scans ({scanCount})
      </h2>
      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        style={{
          padding: '6px 12px',
          background: colors.buttonSecondary,
          border: `1px solid ${colors.borderLight}`,
          color: colors.textPrimary,
          borderRadius: '6px',
          fontSize: '12px',
          fontFamily: fonts.body,
          fontWeight: '500',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          opacity: loading ? 0.5 : 1,
        }}
      >
        <IconRefresh size={14} stroke={1.5} />
        Refresh
      </button>
    </div>
  );
}
