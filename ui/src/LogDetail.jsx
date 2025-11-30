import { colors, fonts } from './theme';

function LogDetail({ log, onClose }) {
  const payload = log.payload_json ? JSON.parse(log.payload_json) : null;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          padding: '12px',
          borderBottom: `1px solid ${colors.borderLight}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3 style={{ fontSize: '14px', fontWeight: 'normal' }}>Details</h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: colors.textPrimary,
            cursor: 'pointer',
            fontSize: '18px',
          }}
        >
          ×
        </button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '12px', fontSize: '12px' }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: colors.textTertiary, marginBottom: '4px', fontFamily: fonts.body }}>
            ID
          </div>
          <div style={{ fontFamily: 'monospace' }}>{log.id}</div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: colors.textTertiary, marginBottom: '4px', fontFamily: fonts.body }}>
            Timestamp
          </div>
          <div style={{ fontFamily: 'monospace' }}>{log.timestamp_iso}</div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: colors.textTertiary, marginBottom: '4px', fontFamily: fonts.body }}>
            Server
          </div>
          <div>{log.server_name}</div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: colors.textTertiary, marginBottom: '4px', fontFamily: fonts.body }}>
            Direction
          </div>
          <div>{log.direction}</div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: colors.textTertiary, marginBottom: '4px', fontFamily: fonts.body }}>
            Method
          </div>
          <div>{log.method || '-'}</div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: colors.textTertiary, marginBottom: '4px', fontFamily: fonts.body }}>
            Status
          </div>
          <div>{log.status || '-'}</div>
        </div>
        {log.request_id && (
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{ color: colors.textTertiary, marginBottom: '4px', fontFamily: fonts.body }}
            >
              Request ID
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '11px' }}>{log.request_id}</div>
          </div>
        )}
        {log.duration_ms && (
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{ color: colors.textTertiary, marginBottom: '4px', fontFamily: fonts.body }}
            >
              Duration
            </div>
            <div>{log.duration_ms.toFixed(2)}ms</div>
          </div>
        )}
        {log.error_message && (
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{ color: colors.textTertiary, marginBottom: '4px', fontFamily: fonts.body }}
            >
              Error
            </div>
            <div style={{ color: colors.error, fontFamily: fonts.body }}>{log.error_message}</div>
          </div>
        )}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: colors.textTertiary, marginBottom: '4px', fontFamily: fonts.body }}>
            Payload
          </div>
          <pre
            style={{
              background: colors.bgTertiary,
              padding: '8px',
              borderRadius: '8px',
              border: `1px solid ${colors.borderLight}`,
              overflow: 'auto',
              fontSize: '11px',
              fontFamily: 'monospace',
              maxHeight: '400px',
            }}
          >
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default LogDetail;
