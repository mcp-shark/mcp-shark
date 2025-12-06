import { colors } from '../../../theme';

export default function ToolItem({ tool, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '16px 20px',
        margin: '4px 8px',
        borderRadius: '8px',
        cursor: 'pointer',
        background: isSelected ? colors.bgSelected : colors.bgCard,
        border: isSelected ? `2px solid ${colors.accentBlue}` : `1px solid ${colors.borderLight}`,
        boxShadow: isSelected ? `0 2px 4px ${colors.shadowSm}` : 'none',
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = colors.bgHover;
          e.currentTarget.style.borderColor = colors.borderMedium;
          e.currentTarget.style.boxShadow = `0 2px 4px ${colors.shadowSm}`;
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = colors.bgCard;
          e.currentTarget.style.borderColor = colors.borderLight;
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: isSelected ? colors.accentBlue : colors.textTertiary,
            marginTop: '6px',
            flexShrink: 0,
            transition: 'background 0.2s',
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: isSelected ? '600' : '500',
              fontSize: '14px',
              color: colors.textPrimary,
              marginBottom: tool.description ? '6px' : '0',
              lineHeight: '1.4',
            }}
          >
            {tool.name}
          </div>
          {tool.description && (
            <div
              style={{
                fontSize: '12px',
                color: colors.textSecondary,
                lineHeight: '1.5',
                marginTop: '4px',
              }}
            >
              {tool.description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
