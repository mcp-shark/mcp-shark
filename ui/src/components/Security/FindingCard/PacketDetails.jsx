import { colors, fonts } from '../../../theme.js';

export function PacketDetails({ packet }) {
  const headers = packet.headers_json ? JSON.parse(packet.headers_json) : null;
  const body = packet.body_json ? JSON.parse(packet.body_json) : packet.body_raw;

  return (
    <div
      style={{
        background: colors.bgCard,
        borderRadius: '6px',
        border: `1px solid ${colors.borderLight}`,
        overflow: 'hidden',
      }}
    >
      {headers && Object.keys(headers).length > 0 && (
        <div style={{ padding: '8px 10px', borderBottom: `1px solid ${colors.borderLight}` }}>
          <div
            style={{
              fontSize: '9px',
              fontWeight: '600',
              color: colors.textTertiary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '4px',
            }}
          >
            Headers
          </div>
          <div style={{ fontSize: '10px', fontFamily: fonts.mono }}>
            {Object.entries(headers).map(([key, value]) => (
              <div key={key} style={{ marginBottom: '2px' }}>
                <span style={{ color: '#0d9488' }}>{key}:</span>{' '}
                <span style={{ color: colors.textPrimary }}>{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {body && (
        <div style={{ padding: '8px 10px' }}>
          <div
            style={{
              fontSize: '9px',
              fontWeight: '600',
              color: colors.textTertiary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '4px',
            }}
          >
            Body
          </div>
          <pre
            style={{
              fontSize: '10px',
              fontFamily: fonts.mono,
              color: colors.textPrimary,
              margin: 0,
              overflow: 'auto',
              maxHeight: '200px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              background: colors.bgTertiary,
              padding: '8px',
              borderRadius: '4px',
            }}
          >
            {typeof body === 'object' ? JSON.stringify(body, null, 2) : body}
          </pre>
        </div>
      )}
    </div>
  );
}
