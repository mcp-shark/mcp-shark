import { IconApi } from '@tabler/icons-react';
import { colors, fonts } from '../../theme';

/**
 * API Documentation button component
 * Opens Swagger/OpenAPI documentation in a new tab
 * @param {Object} props
 * @param {Object} props.style - Custom styles for the button
 * @param {Function} props.onClick - Optional callback when button is clicked
 * @param {Function} props.onMouseEnter - Optional mouse enter handler
 * @param {Function} props.onMouseLeave - Optional mouse leave handler
 */
export default function ApiDocsButton({ style, onClick, onMouseEnter, onMouseLeave }) {
  const handleClick = () => {
    window.open('/api-docs', '_blank');
    if (onClick) {
      onClick();
    }
  };

  const defaultStyle = {
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
    ...style,
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.background = colors.bgHover;
    e.currentTarget.style.color = colors.textPrimary;
    e.currentTarget.style.borderColor = colors.borderMedium;
    e.currentTarget.style.transform = 'scale(1.1)';
    e.currentTarget.style.boxShadow = `0 6px 16px ${colors.shadowLg}`;
    if (onMouseEnter) {
      onMouseEnter(e);
    }
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.background = colors.bgCard;
    e.currentTarget.style.color = colors.textSecondary;
    e.currentTarget.style.borderColor = colors.borderLight;
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.style.boxShadow = `0 4px 12px ${colors.shadowMd}`;
    if (onMouseLeave) {
      onMouseLeave(e);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      data-tour="api-docs-button"
      style={defaultStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title="View API Documentation"
    >
      <IconApi size={20} stroke={1.5} />
    </button>
  );
}
