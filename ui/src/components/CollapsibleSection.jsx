import { useState } from 'react';
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
    style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

function CollapsibleSection({ title, children, titleColor = colors.accentBlue }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div style={{ marginBottom: '16px' }}>
      <div
        style={{
          color: titleColor,
          fontWeight: '600',
          fontFamily: fonts.body,
          fontSize: '12px',
          marginBottom: '8px',
          cursor: 'pointer',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 0',
          transition: 'color 0.15s ease',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={(e) => {
          e.currentTarget.style.color =
            titleColor === colors.accentBlue ? colors.accentBlueHover : titleColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = titleColor;
        }}
      >
        <span
          style={{
            transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 0.2s ease',
            display: 'inline-block',
          }}
        >
          <ChevronDown size={12} color={titleColor} />
        </span>
        {title}
      </div>
      {isExpanded && (
        <div
          style={{
            paddingLeft: '20px',
            color: colors.textPrimary,
            fontFamily: fonts.body,
            fontSize: '12px',
            lineHeight: '1.6',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default CollapsibleSection;
