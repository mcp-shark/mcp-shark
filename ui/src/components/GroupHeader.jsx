import { colors, fonts } from '../theme';

const ChevronDown = ({ size = 12, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ChevronRight = ({ size = 12, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export default function GroupHeader({ children, onClick, isExpanded, indent = 0 }) {
  return (
    <tr
      onClick={onClick}
      style={{
        cursor: 'pointer',
        background: colors.bgSecondary,
        borderBottom: `2px solid ${colors.borderMedium}`,
        borderTop: `2px solid ${colors.borderMedium}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = colors.bgHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = colors.bgSecondary;
      }}
    >
      <td
        colSpan={11}
        style={{
          padding: indent > 0 ? '6px 12px 6px 32px' : '6px 12px',
          color: colors.textPrimary,
          fontFamily: fonts.body,
          fontWeight: '600',
          fontSize: indent > 0 ? '10px' : '11px',
        }}
      >
        <span
          style={{
            marginRight: '8px',
            userSelect: 'none',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </span>
        {children}
      </td>
    </tr>
  );
}
