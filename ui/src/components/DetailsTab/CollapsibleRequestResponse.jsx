import { useState } from 'react';
import { colors, fonts } from '../../theme';
import { IconChevronDown } from '@tabler/icons-react';

export default function CollapsibleRequestResponse({
  title,
  titleColor,
  children,
  defaultExpanded = true,
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div
      style={{
        background: colors.bgCard,
        borderRadius: '8px',
        border: `1px solid ${colors.borderLight}`,
        overflow: 'hidden',
        marginBottom: '20px',
      }}
    >
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '16px 20px',
          background: isExpanded ? colors.bgCard : colors.bgSecondary,
          borderBottom: isExpanded ? `1px solid ${colors.borderLight}` : 'none',
          cursor: 'pointer',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'background-color 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.bgHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isExpanded ? colors.bgCard : colors.bgSecondary;
        }}
      >
        <div
          style={{
            fontSize: '13px',
            fontWeight: '600',
            color: titleColor,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontFamily: fonts.body,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <IconChevronDown
            size={14}
            stroke={1.5}
            style={{
              transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s ease',
            }}
          />
          {title}
        </div>
      </div>
      {isExpanded && <div style={{ padding: '20px' }}>{children}</div>}
    </div>
  );
}
