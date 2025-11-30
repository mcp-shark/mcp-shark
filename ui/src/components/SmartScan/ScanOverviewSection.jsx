import { colors, fonts } from '../../theme';
import { getRiskLevelColor } from './utils';

export default function ScanOverviewSection({ status, overallRiskLevel, createdAt, updatedAt }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        padding: '16px',
        background: colors.bgTertiary,
        borderRadius: '8px',
      }}
    >
      {status && (
        <div>
          <div
            style={{
              fontSize: '11px',
              color: colors.textTertiary,
              fontFamily: fonts.body,
              marginBottom: '4px',
            }}
          >
            Status
          </div>
          <div
            style={{
              fontSize: '13px',
              color: colors.textPrimary,
              fontFamily: fonts.body,
              fontWeight: '500',
            }}
          >
            {status}
          </div>
        </div>
      )}
      {overallRiskLevel && (
        <div>
          <div
            style={{
              fontSize: '11px',
              color: colors.textTertiary,
              fontFamily: fonts.body,
              marginBottom: '4px',
            }}
          >
            Overall Risk Level
          </div>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '700',
              fontFamily: fonts.body,
              background: getRiskLevelColor(overallRiskLevel),
              color: colors.textInverse,
              display: 'inline-block',
            }}
          >
            {overallRiskLevel.toLowerCase()}
          </span>
        </div>
      )}
      {createdAt && (
        <div>
          <div
            style={{
              fontSize: '11px',
              color: colors.textTertiary,
              fontFamily: fonts.body,
              marginBottom: '4px',
            }}
          >
            Created At
          </div>
          <div
            style={{
              fontSize: '13px',
              color: colors.textPrimary,
              fontFamily: fonts.body,
              fontWeight: '500',
            }}
          >
            {formatDate(createdAt)}
          </div>
        </div>
      )}
      {updatedAt && (
        <div>
          <div
            style={{
              fontSize: '11px',
              color: colors.textTertiary,
              fontFamily: fonts.body,
              marginBottom: '4px',
            }}
          >
            Updated At
          </div>
          <div
            style={{
              fontSize: '13px',
              color: colors.textPrimary,
              fontFamily: fonts.body,
              fontWeight: '500',
            }}
          >
            {formatDate(updatedAt)}
          </div>
        </div>
      )}
    </div>
  );
}
