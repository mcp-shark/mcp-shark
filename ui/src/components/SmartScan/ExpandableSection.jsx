import { useState } from 'react';
import { colors, fonts } from '../../theme';

export default function ExpandableSection({ title, count, children, defaultExpanded = false }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div
      style={{
        background: colors.bgTertiary,
        borderRadius: '8px',
        border: `1px solid ${colors.borderLight}`,
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontFamily: fonts.body,
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.bgCard;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: colors.textPrimary,
              fontFamily: fonts.body,
            }}
          >
            {title}
          </span>
          {count !== undefined && (
            <span
              style={{
                padding: '2px 6px',
                background: colors.bgCard,
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: '500',
                color: colors.textSecondary,
                border: `1px solid ${colors.borderLight}`,
                fontFamily: fonts.body,
              }}
            >
              {count}
            </span>
          )}
        </div>
        <svg
          style={{
            width: '14px',
            height: '14px',
            color: colors.textSecondary,
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s',
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          role="img"
          aria-label="Chevron icon"
        >
          <title>Chevron icon</title>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && (
        <div
          style={{
            padding: '12px',
            borderTop: `1px solid ${colors.borderLight}`,
            background: colors.bgCard,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
