import { colors, fonts } from '../../theme';

const POSTURES = [
  { id: null, label: 'All', dotColor: colors.textTertiary },
  { id: 'signed', label: 'Signed', dotColor: colors.success },
  { id: 'aauth-aware', label: 'AAuth-aware', dotColor: colors.accentBlue },
  { id: 'bearer', label: 'Bearer', dotColor: colors.warning },
  { id: 'none', label: 'No auth', dotColor: colors.textTertiary },
];

/**
 * Segmented selector that filters captured traffic by AAuth posture.
 * Visualization-only — does not change the underlying traffic in any way.
 */
export default function AAuthPostureFilter({ value, onChange }) {
  return (
    <div
      title="Filter packets by observed AAuth posture (no verification)"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0,
        background: colors.bgPrimary,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: '999px',
        padding: '2px',
        height: '34px',
      }}
    >
      <span
        style={{
          fontSize: '10px',
          fontFamily: fonts.body,
          color: colors.textTertiary,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          padding: '0 8px 0 10px',
        }}
      >
        AAuth
      </span>
      {POSTURES.map((option) => {
        const active = (value || null) === (option.id || null);
        return (
          <button
            key={option.label}
            type="button"
            onClick={() => onChange(option.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '11px',
              fontFamily: fonts.body,
              fontWeight: active ? 600 : 500,
              color: active ? colors.textPrimary : colors.textSecondary,
              background: active ? colors.bgSelected : 'transparent',
              borderRadius: '999px',
              transition: 'background-color 0.15s ease',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: option.dotColor,
                display: 'inline-block',
              }}
            />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
