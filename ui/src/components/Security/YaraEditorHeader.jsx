import { IconCode, IconPlus, IconRefresh, IconX } from '@tabler/icons-react';
import { colors, fonts } from '../../theme';

export function YaraEditorHeader({
  isEditing,
  onNew,
  onCancel,
  onResetDefaults,
  resetting,
  hasPredefined,
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}
    >
      <h3
        style={{
          fontSize: '14px',
          fontWeight: 600,
          color: colors.textSecondary,
          fontFamily: fonts.body,
          textTransform: 'uppercase',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <IconCode size={16} />
        YARA Rules
      </h3>
      <div style={{ display: 'flex', gap: '8px' }}>
        {!isEditing && hasPredefined && onResetDefaults && (
          <button
            type="button"
            onClick={onResetDefaults}
            disabled={resetting}
            style={{
              background: 'transparent',
              color: resetting ? colors.textTertiary : colors.textSecondary,
              border: `1px solid ${colors.borderLight}`,
              borderRadius: '6px',
              padding: '8px 14px',
              cursor: resetting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontFamily: fonts.body,
            }}
          >
            <IconRefresh size={14} className={resetting ? 'spin' : ''} />
            {resetting ? 'Resetting...' : 'Reset Defaults'}
          </button>
        )}
        {!isEditing && (
          <button
            type="button"
            onClick={onNew}
            style={{
              background: colors.buttonPrimary,
              color: colors.textInverse,
              border: 'none',
              borderRadius: '6px',
              padding: '8px 14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontFamily: fonts.body,
              fontWeight: 600,
            }}
          >
            <IconPlus size={14} />
            New Rule
          </button>
        )}
        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: 'transparent',
              color: colors.textSecondary,
              border: `1px solid ${colors.borderLight}`,
              borderRadius: '6px',
              padding: '8px 14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontFamily: fonts.body,
            }}
          >
            <IconX size={14} />
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
