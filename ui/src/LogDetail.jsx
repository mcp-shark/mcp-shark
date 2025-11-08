function LogDetail({ log, onClose }) {
  const payload = log.payload_json ? JSON.parse(log.payload_json) : null;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          padding: '12px',
          borderBottom: '1px solid #333',
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
            color: '#d4d4d4',
            cursor: 'pointer',
            fontSize: '18px',
          }}
        >
          ×
        </button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '12px', fontSize: '12px' }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: '#858585', marginBottom: '4px' }}>ID</div>
          <div style={{ fontFamily: 'monospace' }}>{log.id}</div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: '#858585', marginBottom: '4px' }}>Timestamp</div>
          <div style={{ fontFamily: 'monospace' }}>{log.timestamp_iso}</div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: '#858585', marginBottom: '4px' }}>Server</div>
          <div>{log.server_name}</div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: '#858585', marginBottom: '4px' }}>Direction</div>
          <div>{log.direction}</div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: '#858585', marginBottom: '4px' }}>Method</div>
          <div>{log.method || '-'}</div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: '#858585', marginBottom: '4px' }}>Status</div>
          <div>{log.status || '-'}</div>
        </div>
        {log.request_id && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ color: '#858585', marginBottom: '4px' }}>Request ID</div>
            <div style={{ fontFamily: 'monospace', fontSize: '11px' }}>{log.request_id}</div>
          </div>
        )}
        {log.duration_ms && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ color: '#858585', marginBottom: '4px' }}>Duration</div>
            <div>{log.duration_ms.toFixed(2)}ms</div>
          </div>
        )}
        {log.error_message && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ color: '#858585', marginBottom: '4px' }}>Error</div>
            <div style={{ color: '#f48771' }}>{log.error_message}</div>
          </div>
        )}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: '#858585', marginBottom: '4px' }}>Payload</div>
          <pre
            style={{
              background: '#1e1e1e',
              padding: '8px',
              borderRadius: '4px',
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
