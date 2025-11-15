import { colors, fonts } from '../../theme';

const HelpIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export default function HelpButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      data-tour="help-button"
      style={{
        position: 'absolute',
        top: '12px',
        right: '16px',
        background: colors.bgCard,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: '8px',
        padding: '8px 12px',
        color: colors.textSecondary,
        cursor: 'pointer',
        fontFamily: fonts.body,
        fontSize: '12px',
        fontWeight: '500',
        boxShadow: `0 2px 4px ${colors.shadowSm}`,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        zIndex: 100,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = colors.bgHover;
        e.currentTarget.style.color = colors.textPrimary;
        e.currentTarget.style.borderColor = colors.borderMedium;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = colors.bgCard;
        e.currentTarget.style.color = colors.textSecondary;
        e.currentTarget.style.borderColor = colors.borderLight;
      }}
      title="Start interactive tour"
    >
      <HelpIcon size={14} />
      Start Tour
    </button>
  );
}
