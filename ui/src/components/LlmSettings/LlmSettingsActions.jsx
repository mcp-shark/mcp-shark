import { colors, fonts } from '../../theme';

export default function LlmSettingsActions({ disabled, saving, testing, onSave, onTest }) {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <button
        type="button"
        onClick={onSave}
        disabled={disabled}
        style={{
          padding: '10px 14px',
          borderRadius: '10px',
          border: `1px solid ${colors.borderLight}`,
          background: colors.accentBlue,
          color: 'white',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontFamily: fonts.body,
          fontSize: '13px',
          fontWeight: '600',
          opacity: disabled ? 0.7 : 1,
        }}
      >
        {saving ? 'Saving…' : 'Save settings'}
      </button>

      <button
        type="button"
        onClick={onTest}
        disabled={disabled || testing}
        style={{
          padding: '10px 14px',
          borderRadius: '10px',
          border: `1px solid ${colors.borderLight}`,
          background: colors.bgSecondary,
          color: colors.textPrimary,
          cursor: disabled || testing ? 'not-allowed' : 'pointer',
          fontFamily: fonts.body,
          fontSize: '13px',
          fontWeight: '600',
          opacity: disabled || testing ? 0.7 : 1,
        }}
      >
        {testing ? 'Testing…' : 'Test load model'}
      </button>
    </div>
  );
}
