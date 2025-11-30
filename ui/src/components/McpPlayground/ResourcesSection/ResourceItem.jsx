import { colors } from '../../../theme';

export default function ResourceItem({ resource, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '12px',
        borderBottom: `1px solid ${colors.borderLight}`,
        cursor: 'pointer',
        background: isSelected ? colors.bgSecondary : colors.bgCard,
        transition: 'background 0.2s',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = colors.bgHover;
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = colors.bgCard;
        }
      }}
    >
      <div
        style={{
          fontWeight: '500',
          fontSize: '13px',
          color: colors.textPrimary,
          marginBottom: '4px',
        }}
      >
        {resource.uri}
      </div>
      {resource.name && (
        <div
          style={{
            fontSize: '12px',
            color: colors.textSecondary,
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
            marginTop: '4px',
          }}
        >
          {resource.description}
        </div>
      )}
    </div>
  );
}
