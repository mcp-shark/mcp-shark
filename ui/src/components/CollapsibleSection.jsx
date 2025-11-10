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
          marginBottom: '4px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <ChevronDown size={12} /> {title}
      </div>
      {isExpanded && (
        <div style={{ paddingLeft: '16px', color: colors.textPrimary, fontFamily: fonts.body }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default CollapsibleSection;
