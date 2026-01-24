import { colors, fonts } from '../../theme';

function FindingDetailRow({ finding, colSpan }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        style={{
          padding: '16px 20px',
          background: `${colors.accent}08`,
          borderBottom: `1px solid ${colors.borderLight}`,
        }}
      >
        <div style={{ display: 'grid', gap: '12px' }}>
          {/* Description */}
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: '600',
                color: colors.textSecondary,
                fontFamily: fonts.body,
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}
            >
              Description
            </div>
            <p
              style={{
                fontSize: '13px',
                color: colors.textPrimary,
                fontFamily: fonts.body,
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {finding.description}
            </p>
          </div>

          {/* Evidence */}
          {finding.evidence && (
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: colors.textSecondary,
                  fontFamily: fonts.body,
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                }}
              >
                Evidence
              </div>
              <code
                style={{
                  display: 'block',
                  padding: '8px 12px',
                  background: colors.bgSecondary,
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontFamily: fonts.mono,
                  color: colors.textPrimary,
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {finding.evidence}
              </code>
            </div>
          )}

          {/* Recommendation */}
          {finding.recommendation && (
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: colors.textSecondary,
                  fontFamily: fonts.body,
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                }}
              >
                Recommendation
              </div>
              <p
                style={{
                  fontSize: '13px',
                  color: colors.success,
                  fontFamily: fonts.body,
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {finding.recommendation}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '12px' }}>
            <div>
              <span style={{ color: colors.textSecondary }}>Rule: </span>
              <span style={{ fontFamily: fonts.mono, color: colors.textPrimary }}>
                {finding.rule_id}
              </span>
            </div>
            {finding.frame_number && (
              <div>
                <span style={{ color: colors.textSecondary }}>Frame: </span>
                <span style={{ color: colors.textPrimary }}>#{finding.frame_number}</span>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

export default FindingDetailRow;
