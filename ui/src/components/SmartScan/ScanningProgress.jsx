import { colors, fonts } from '../../theme';
import { LoadingSpinner } from '../SmartScanIcons';

export default function ScanningProgress({ scanning, selectedServers }) {
  if (!scanning) {
    return null;
  }

  return (
    <div
      style={{
        background: colors.bgCard,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: `0 2px 8px ${colors.shadowSm}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <LoadingSpinner size={20} />
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: colors.textPrimary,
              fontFamily: fonts.body,
              margin: 0,
              marginBottom: '4px',
            }}
          >
            Scanning {selectedServers.size} server{selectedServers.size !== 1 ? 's' : ''}...
          </p>
          <p
            style={{
              fontSize: '12px',
              color: colors.textSecondary,
              fontFamily: fonts.body,
              margin: 0,
            }}
          >
            Analyzing security vulnerabilities and risks
          </p>
        </div>
      </div>
    </div>
  );
}
