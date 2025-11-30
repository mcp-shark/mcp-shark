import { CheckIcon, CacheIcon } from '../../SmartScanIcons';
import { colors, fonts } from '../../../theme';

export default function BatchResultsHeader({ scanResults }) {
  const cachedCount = scanResults.filter((r) => r.cached).length;
  const scannedCount = scanResults.filter((r) => r.success && !r.cached).length;
  const allCached = scanResults.every((r) => r.cached);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}
    >
      <div>
        <h2
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: colors.textPrimary,
            fontFamily: fonts.body,
            margin: 0,
            marginBottom: '4px',
          }}
        >
          Scan Results ({scanResults.length} server{scanResults.length !== 1 ? 's' : ''})
        </h2>
        {allCached && (
          <p
            style={{
              fontSize: '12px',
              color: colors.textTertiary,
              fontFamily: fonts.body,
              margin: 0,
            }}
          >
            Showing cached results. Run a new scan to get the latest analysis.
          </p>
        )}
      </div>
      {scanResults.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            fontSize: '13px',
            color: colors.textSecondary,
            fontFamily: fonts.body,
          }}
        >
          {cachedCount > 0 && (
            <span
              style={{
                padding: '6px 10px',
                background: colors.bgTertiary,
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontFamily: fonts.body,
              }}
            >
              <CacheIcon size={12} color={colors.textSecondary} />
              <span>{cachedCount} cached</span>
            </span>
          )}
          {scannedCount > 0 && (
            <span
              style={{
                padding: '6px 10px',
                background: colors.bgTertiary,
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <CheckIcon size={12} color={colors.accentGreen} />
              <span>{scannedCount} scanned</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
