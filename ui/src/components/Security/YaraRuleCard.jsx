import { IconTrash } from '@tabler/icons-react';
import { colors, fonts } from '../../theme';

export function YaraRuleCard({ rule, onEdit, onDelete, onToggle }) {
  return (
    <div
      style={{
        background: colors.bgCard,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px',
          }}
        >
          <span style={{ fontFamily: fonts.mono, fontSize: '13px', color: colors.textPrimary }}>
            {rule.name}
          </span>
          <span
            style={{
              background: rule.enabled ? colors.successBg : colors.bgSecondary,
              color: rule.enabled ? colors.success : colors.textTertiary,
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontFamily: fonts.body,
              textTransform: 'uppercase',
            }}
          >
            {rule.enabled ? 'enabled' : 'disabled'}
          </span>
          {rule.severity && (
            <span
              style={{
                background: colors[`${rule.severity}Bg`] || colors.bgSecondary,
                color: colors[rule.severity] || colors.textSecondary,
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                fontFamily: fonts.body,
                textTransform: 'uppercase',
              }}
            >
              {rule.severity}
            </span>
          )}
        </div>
        {rule.description && (
          <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0 }}>
            {rule.description}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          onClick={() => onToggle(rule.rule_id, !rule.enabled)}
          style={{
            background: 'transparent',
            border: 'none',
            color: colors.textSecondary,
            cursor: 'pointer',
            padding: '4px 8px',
            fontSize: '11px',
            fontFamily: fonts.body,
          }}
        >
          {rule.enabled ? 'Disable' : 'Enable'}
        </button>
        <button
          type="button"
          onClick={() => onEdit(rule)}
          style={{
            background: 'transparent',
            border: 'none',
            color: colors.accent,
            cursor: 'pointer',
            padding: '4px 8px',
            fontSize: '11px',
            fontFamily: fonts.body,
          }}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(rule.rule_id)}
          style={{
            background: 'transparent',
            border: 'none',
            color: colors.critical,
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          <IconTrash size={14} />
        </button>
      </div>
    </div>
  );
}
