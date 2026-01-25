import { IconAlertTriangle, IconCheck } from '@tabler/icons-react';
import { colors, fonts } from '../../theme';

function ValidationMessages({ validation }) {
  if (!validation) {
    return null;
  }

  return (
    <div style={{ marginBottom: '12px' }}>
      {validation.errors?.map((error) => (
        <div
          key={error}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: colors.critical,
            fontSize: '12px',
            fontFamily: fonts.body,
            marginBottom: '4px',
          }}
        >
          <IconAlertTriangle size={14} />
          {error}
        </div>
      ))}
      {validation.warnings?.map((warning) => (
        <div
          key={warning}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: colors.warning,
            fontSize: '12px',
            fontFamily: fonts.body,
            marginBottom: '4px',
          }}
        >
          <IconAlertTriangle size={14} />
          {warning}
        </div>
      ))}
    </div>
  );
}

export function YaraRuleEditor({ content, onChange, onSave, onCancel, validation, saving }) {
  return (
    <div
      style={{
        background: colors.bgCard,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
      }}
    >
      <ValidationMessages validation={validation} />
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter YARA rule..."
        style={{
          width: '100%',
          minHeight: '300px',
          background: colors.bgSecondary,
          border: `1px solid ${colors.borderLight}`,
          borderRadius: '8px',
          padding: '12px',
          fontFamily: fonts.mono,
          fontSize: '12px',
          color: colors.textPrimary,
          resize: 'vertical',
          outline: 'none',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            background: 'transparent',
            color: colors.textSecondary,
            border: `1px solid ${colors.borderLight}`,
            borderRadius: '6px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '12px',
            fontFamily: fonts.body,
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          style={{
            background: colors.buttonPrimary,
            color: colors.textInverse,
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontFamily: fonts.body,
            fontWeight: 600,
            opacity: saving ? 0.6 : 1,
          }}
        >
          <IconCheck size={14} />
          {saving ? 'Saving...' : 'Save Rule'}
        </button>
      </div>
    </div>
  );
}
