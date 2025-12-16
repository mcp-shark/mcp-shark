import { colors, fonts } from '../../theme';
import ExpandableSection from './ExpandableSection';

export default function NotablePatternsSection({ patterns }) {
  if (!patterns || patterns.length === 0) {
    return null;
  }

  return (
    <ExpandableSection title="Notable Patterns" count={patterns.length} defaultExpanded={false}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {patterns.map((pattern, index) => (
          <div
            key={`pattern-${pattern.type || index}-${index}`}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              padding: '8px',
              background: `${colors.accentOrange}10`,
              borderRadius: '6px',
              border: `1px solid ${colors.accentOrange}20`,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${colors.accentOrange}15`;
              e.currentTarget.style.borderColor = `${colors.accentOrange}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `${colors.accentOrange}10`;
              e.currentTarget.style.borderColor = `${colors.accentOrange}20`;
            }}
          >
            <div
              style={{
                flexShrink: 0,
                marginTop: '2px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: `${colors.accentOrange}30`,
                border: `1px solid ${colors.accentOrange}60`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                style={{ width: '10px', height: '10px', color: colors.accentOrange }}
                fill="currentColor"
                viewBox="0 0 20 20"
                role="img"
                aria-label="Pattern icon"
              >
                <title>Pattern icon</title>
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p
              style={{
                fontSize: '12px',
                color: colors.textPrimary,
                lineHeight: '1.5',
                flex: 1,
                margin: 0,
                fontFamily: fonts.body,
              }}
            >
              {pattern}
            </p>
          </div>
        ))}
      </div>
    </ExpandableSection>
  );
}
