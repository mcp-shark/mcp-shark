import { colors, fonts } from '../../theme';

const TourIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    role="img"
    aria-label="Tour icon"
  >
    <title>Tour icon</title>
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

export default function HelpButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-tour="help-button"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
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
      title="Start tour"
    >
      <TourIcon size={20} />
    </button>
  );
}
