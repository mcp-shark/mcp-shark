import { colors, fonts } from '../../theme';
import ExpandableSection from './ExpandableSection';

export default function RecommendationsSection({ recommendations }) {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <ExpandableSection
      title="Recommendations"
      count={recommendations.length}
      defaultExpanded={false}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {recommendations.map((recommendation, index) => (
          <div
            key={`recommendation-${recommendation.type || index}-${index}`}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              padding: '8px',
              background: `${colors.accentBlue}10`,
              borderRadius: '6px',
              border: `1px solid ${colors.accentBlue}20`,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${colors.accentBlue}15`;
              e.currentTarget.style.borderColor = `${colors.accentBlue}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `${colors.accentBlue}10`;
              e.currentTarget.style.borderColor = `${colors.accentBlue}20`;
            }}
          >
            <div
              style={{
                flexShrink: 0,
                marginTop: '2px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: `${colors.accentBlue}30`,
                border: `1px solid ${colors.accentBlue}60`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: '600',
                  color: colors.accentBlue,
                  fontFamily: fonts.body,
                }}
              >
                {index + 1}
              </span>
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
              {recommendation}
            </p>
          </div>
        ))}
      </div>
    </ExpandableSection>
  );
}
