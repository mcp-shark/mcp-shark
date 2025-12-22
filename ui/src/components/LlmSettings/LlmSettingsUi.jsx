import { colors, fonts } from '../../theme';

export function LabeledRow({ label, description, children }) {
  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '13px',
            fontWeight: '600',
            color: colors.textPrimary,
            fontFamily: fonts.body,
            marginBottom: '4px',
          }}
        >
          {label}
        </div>
        {description && (
          <div
            style={{
              fontSize: '12px',
              color: colors.textSecondary,
              fontFamily: fonts.body,
              lineHeight: '1.5',
            }}
          >
            {description}
          </div>
        )}
      </div>
      <div style={{ width: '360px', flexShrink: 0 }}>{children}</div>
    </div>
  );
}

export function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          onChange(!checked);
        }
      }}
      style={{
        width: '56px',
        height: '30px',
        borderRadius: '999px',
        border: `1px solid ${colors.borderLight}`,
        background: checked ? colors.accentBlue : colors.bgSecondary,
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.15s ease',
      }}
      aria-pressed={checked}
    >
      <span
        style={{
          width: '22px',
          height: '22px',
          borderRadius: '999px',
          background: colors.bgCard,
          transform: checked ? 'translateX(26px)' : 'translateX(0px)',
          transition: 'transform 0.15s ease',
          boxShadow: `0 1px 2px ${colors.shadowSm}`,
        }}
      />
    </button>
  );
}

export function TextInput({ value, onChange, placeholder, disabled, type = 'text' }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      type={type}
      style={{
        width: '100%',
        padding: '10px 12px',
        borderRadius: '10px',
        border: `1px solid ${colors.borderLight}`,
        background: disabled ? colors.bgSecondary : colors.bgCard,
        color: colors.textPrimary,
        fontFamily: fonts.body,
        fontSize: '13px',
        outline: 'none',
        boxSizing: 'border-box',
      }}
    />
  );
}

export function Select({ value, onChange, options, disabled }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '10px 12px',
        borderRadius: '10px',
        border: `1px solid ${colors.borderLight}`,
        background: disabled ? colors.bgSecondary : colors.bgCard,
        color: colors.textPrimary,
        fontFamily: fonts.body,
        fontSize: '13px',
        outline: 'none',
        boxSizing: 'border-box',
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function Notice({ tone = 'info', title, children }) {
  const border =
    tone === 'danger'
      ? colors.accentRed
      : tone === 'warning'
        ? colors.accentOrange
        : colors.borderLight;

  const bg =
    tone === 'danger'
      ? `${colors.accentRed}15`
      : tone === 'warning'
        ? `${colors.accentOrange}15`
        : colors.bgSecondary;

  return (
    <div
      style={{
        border: `1px solid ${border}`,
        background: bg,
        borderRadius: '12px',
        padding: '12px 14px',
        marginTop: '12px',
      }}
    >
      <div style={{ fontFamily: fonts.body, fontWeight: '600', fontSize: '13px' }}>{title}</div>
      <div style={{ fontFamily: fonts.body, fontSize: '12px', color: colors.textSecondary }}>
        {children}
      </div>
    </div>
  );
}
