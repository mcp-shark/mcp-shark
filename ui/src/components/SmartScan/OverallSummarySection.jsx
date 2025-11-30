import { colors, fonts } from '../../theme';
import { getRiskLevelColor } from './utils';
import ExpandableSection from './ExpandableSection';

export default function OverallSummarySection({ overallRiskLevel, overallReason }) {
  if (!overallRiskLevel) return null;

  return (
    <ExpandableSection title="Overall Summary" count={overallReason ? 1 : 0} defaultExpanded={true}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: colors.textPrimary,
              fontFamily: fonts.body,
            }}
          >
            Overall Risk Level:
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: '700',
              color: colors.textInverse,
              background: getRiskLevelColor(overallRiskLevel),
              fontFamily: fonts.body,
            }}
          >
            {overallRiskLevel.toUpperCase()}
          </span>
        </div>
        {overallReason && (
          <div style={{ fontSize: '12px', color: colors.textSecondary, fontFamily: fonts.body }}>
            {(() => {
              const separator = overallReason.includes('\n')
                ? '\n'
                : overallReason.includes(' | ')
                  ? ' | '
                  : null;

              if (separator) {
                return (
                  <ul
                    style={{
                      listStyle: 'disc',
                      listStylePosition: 'inside',
                      margin: 0,
                      paddingLeft: '8px',
                    }}
                  >
                    {overallReason.split(separator).map((item, index) => (
                      <li key={index} style={{ fontSize: '12px', marginBottom: '2px' }}>
                        {item.trim()}
                      </li>
                    ))}
                  </ul>
                );
              }
              return <p style={{ fontSize: '12px' }}>{overallReason}</p>;
            })()}
          </div>
        )}
      </div>
    </ExpandableSection>
  );
}
