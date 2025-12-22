import { colors } from '../../theme';

export default function DriftDetailHeader({ drift, onClose }) {
  if (!drift) {
    return null;
  }

  return (
    <div
      style={{
        padding: '16px',
        borderBottom: `1px solid ${colors.borderLight}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div>
        <h2 style={{ margin: 0, fontSize: '18px', color: colors.textPrimary }}>
          Tool Manifest Drift
        </h2>
        <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px' }}>
          {drift.server_key} • {new Date(Number(drift.created_at)).toLocaleString()}
        </div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: '8px 16px',
            background: colors.bgSecondary,
            border: `1px solid ${colors.borderLight}`,
            borderRadius: '6px',
            color: colors.textPrimary,
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      )}
    </div>
  );
}
