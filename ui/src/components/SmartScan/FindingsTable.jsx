import { colors, fonts } from '../../theme';
import { getRiskLevelColor } from './utils';

export default function FindingsTable({ findings, type }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', fontSize: '12px', fontFamily: fonts.body }}>
        <thead>
          <tr
            style={{
              borderBottom: `1px solid ${colors.borderLight}`,
              background: colors.bgTertiary,
            }}
          >
            <th
              style={{
                textAlign: 'left',
                padding: '6px 8px',
                fontSize: '10px',
                fontWeight: '600',
                color: colors.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Name
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: '6px 8px',
                fontSize: '10px',
                fontWeight: '600',
                color: colors.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Risk Level
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: '6px 8px',
                fontSize: '10px',
                fontWeight: '600',
                color: colors.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Risk Score
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: '6px 8px',
                fontSize: '10px',
                fontWeight: '600',
                color: colors.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Tags
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: '6px 8px',
                fontSize: '10px',
                fontWeight: '600',
                color: colors.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Reasons
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: '6px 8px',
                fontSize: '10px',
                fontWeight: '600',
                color: colors.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Safe Use Notes
            </th>
            {type === 'tool' && (
              <th
                style={{
                  textAlign: 'left',
                  padding: '6px 8px',
                  fontSize: '10px',
                  fontWeight: '600',
                  color: colors.textTertiary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Poisoned
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {findings.map((finding, index) => (
            <tr
              key={index}
              style={{
                borderBottom: `1px solid ${colors.borderLight}`,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.bgTertiary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <td
                style={{
                  padding: '8px',
                  fontSize: '12px',
                  color: colors.textPrimary,
                  fontWeight: '500',
                  fontFamily: fonts.body,
                }}
              >
                {finding.name}
              </td>
              <td style={{ padding: '8px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '700',
                    color: colors.textInverse,
                    background: getRiskLevelColor(finding.risk_level),
                    fontFamily: fonts.body,
                  }}
                >
                  {finding.risk_level?.toUpperCase()}
                </span>
              </td>
              <td
                style={{
                  padding: '8px',
                  fontSize: '12px',
                  color: colors.textSecondary,
                  fontFamily: fonts.body,
                }}
              >
                {finding.risk_score}
              </td>
              <td style={{ padding: '8px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                  {finding.risk_tags?.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      style={{
                        padding: '2px 6px',
                        background: colors.bgCard,
                        borderRadius: '4px',
                        fontSize: '10px',
                        color: colors.textSecondary,
                        border: `1px solid ${colors.borderLight}`,
                        fontFamily: fonts.body,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </td>
              <td
                style={{
                  padding: '8px',
                  fontSize: '12px',
                  color: colors.textSecondary,
                  fontFamily: fonts.body,
                }}
              >
                <ul
                  style={{ listStyle: 'disc', listStylePosition: 'inside', margin: 0, padding: 0 }}
                >
                  {finding.reasons?.map((reason, reasonIndex) => (
                    <li key={reasonIndex} style={{ fontSize: '10px', marginBottom: '2px' }}>
                      {reason}
                    </li>
                  ))}
                </ul>
              </td>
              <td
                style={{
                  padding: '8px',
                  fontSize: '10px',
                  color: colors.textSecondary,
                  maxWidth: '200px',
                  fontFamily: fonts.body,
                }}
              >
                {finding.safe_use_notes}
              </td>
              {type === 'tool' && finding.hasOwnProperty('is_potentially_poisoned') && (
                <td style={{ padding: '8px' }}>
                  {finding.is_potentially_poisoned ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '2px 6px',
                        fontSize: '10px',
                        fontWeight: '500',
                        borderRadius: '4px',
                        background: colors.error + '20',
                        color: colors.error,
                        border: `1px solid ${colors.error}40`,
                        fontFamily: fonts.body,
                      }}
                    >
                      Yes
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '2px 6px',
                        fontSize: '10px',
                        fontWeight: '500',
                        borderRadius: '4px',
                        background: colors.accentGreen + '20',
                        color: colors.accentGreen,
                        border: `1px solid ${colors.accentGreen}40`,
                        fontFamily: fonts.body,
                      }}
                    >
                      No
                    </span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
