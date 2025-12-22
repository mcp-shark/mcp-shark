import { IconApi } from '@tabler/icons-react';
import { colors, fonts } from '../../theme';

/**
 * API Documentation button component
 * Opens Swagger/OpenAPI documentation in a new tab
 */
export default function ApiDocsButton() {
  const handleClick = () => {
    window.open('/api-docs', '_blank');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      data-tour="api-docs-button"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '80px',
        background: colors.bgCard,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: '50%',
        width: '48px',
        height: '48px',
        padding: 0,
        color: colors.textSecondary,
        cursor: 'pointer',
        fontFamily: fonts.body,
        boxShadow: `0 4px 12px ${colors.shadowMd}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = colors.bgHover;
        e.currentTarget.style.color = colors.textPrimary;
        e.currentTarget.style.borderColor = colors.borderMedium;
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = `0 6px 16px ${colors.shadowLg}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = colors.bgCard;
        e.currentTarget.style.color = colors.textSecondary;
        e.currentTarget.style.borderColor = colors.borderLight;
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = `0 4px 12px ${colors.shadowMd}`;
      }}
      title="View API Documentation"
    >
      <IconApi size={20} stroke={1.5} />
    </button>
  );
}
