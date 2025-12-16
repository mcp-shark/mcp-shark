import { IconExternalLink, IconX } from '@tabler/icons-react';
import { colors, fonts } from '../../theme';

export default function ScanDetailHeader({ scanId, serverName, onClose }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}
    >
      <div>
        <h2
          style={{
            fontSize: '16px',
            fontWeight: '600',
            color: colors.textPrimary,
            fontFamily: fonts.body,
            margin: 0,
            marginBottom: '8px',
          }}
        >
          {serverName}
        </h2>
        {scanId && (
          <div
            style={{
              fontSize: '12px',
              color: colors.textTertiary,
              fontFamily: fonts.body,
            }}
          >
            ID: {scanId}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {scanId && (
          <a
            href={`https://smart.mcpshark.sh/scan-results?id=${scanId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '6px 12px',
              background: colors.buttonPrimary,
              border: 'none',
              color: colors.textInverse,
              borderRadius: '6px',
              fontSize: '12px',
              fontFamily: fonts.body,
              fontWeight: '500',
              textDecoration: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <IconExternalLink size={14} stroke={1.5} />
            View on Smart Scan
          </a>
        )}
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: '6px',
            background: 'transparent',
            border: 'none',
            color: colors.textSecondary,
            cursor: 'pointer',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.bgTertiary;
            e.currentTarget.style.color = colors.textPrimary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = colors.textSecondary;
          }}
        >
          <IconX size={20} stroke={1.5} />
        </button>
      </div>
    </div>
  );
}
