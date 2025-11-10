import { colors, fonts } from '../theme';

function PacketDetailHeader({ request, onClose }) {
  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div
      style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${colors.borderLight}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: colors.bgCard,
        boxShadow: `0 1px 3px ${colors.shadowSm}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h3
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: colors.textPrimary,
            margin: 0,
            fontFamily: fonts.body,
          }}
        >
          #{request.frame_number}:{' '}
          {request.direction === 'request' ? 'HTTP Request' : 'HTTP Response'}
        </h3>
        <span
          style={{
            fontSize: '11px',
            color: colors.textSecondary,
            padding: '4px 8px',
            background: colors.bgSecondary,
            borderRadius: '6px',
            fontFamily: fonts.mono,
          }}
        >
          {formatBytes(request.length)} bytes
        </span>
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: colors.textSecondary,
          cursor: 'pointer',
          fontSize: '20px',
          padding: '4px 8px',
          borderRadius: '4px',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.bgHover;
          e.currentTarget.style.color = colors.textPrimary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'none';
          e.currentTarget.style.color = colors.textSecondary;
        }}
      >
        ×
      </button>
    </div>
  );
}

export default PacketDetailHeader;
