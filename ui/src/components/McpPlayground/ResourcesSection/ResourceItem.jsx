import { colors } from '../../../theme';

export default function ResourceItem({ resource, isSelected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Select resource ${resource.uri}`}
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
        width: '100%',
        textAlign: 'left',
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
              marginBottom: resource.name || resource.description ? '6px' : '0',
              lineHeight: '1.4',
              wordBreak: 'break-word',
            }}
          >
            {resource.uri}
          </div>
          {resource.name && (
            <div
              style={{
                fontSize: '13px',
                color: colors.textPrimary,
                fontWeight: '500',
                lineHeight: '1.5',
                marginTop: '4px',
              }}
            >
              {resource.name}
            </div>
          )}
          {resource.description && (
            <div
              style={{
                fontSize: '12px',
                color: colors.textSecondary,
                lineHeight: '1.5',
                marginTop: resource.name ? '2px' : '4px',
              }}
            >
              {resource.description}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
