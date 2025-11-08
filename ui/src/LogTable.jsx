function LogTable({ logs, selected, onSelect }) {
  const getStatusColor = (status) => {
    if (status === 'error') return '#f48771';
    if (status === 'success') return '#89d185';
    if (status === 'pending') return '#dcdcaa';
    return '#888';
  };

  const formatTime = (iso) => {
    return new Date(iso).toLocaleTimeString();
  };

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead style={{ position: 'sticky', top: 0, background: '#252526', zIndex: 1 }}>
          <tr>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid #333' }}>
              Time
            </th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid #333' }}>
              Server
            </th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid #333' }}>
              Dir
            </th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid #333' }}>
              Method
            </th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid #333' }}>
              Status
            </th>
            <th style={{ padding: '6px 8px', textAlign: 'right', borderBottom: '1px solid #333' }}>
              Duration
            </th>
            <th style={{ padding: '6px 8px', textAlign: 'right', borderBottom: '1px solid #333' }}>
              Size
            </th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr
              key={log.id}
              onClick={() => onSelect(log)}
              style={{
                cursor: 'pointer',
                background:
                  selected?.id === log.id ? '#264f78' : log.id % 2 === 0 ? '#1e1e1e' : '#252526',
                borderBottom: '1px solid #333',
              }}
              onMouseEnter={(e) => {
                if (selected?.id !== log.id) e.currentTarget.style.background = '#2a2d2e';
              }}
              onMouseLeave={(e) => {
                if (selected?.id !== log.id)
                  e.currentTarget.style.background = log.id % 2 === 0 ? '#1e1e1e' : '#252526';
              }}
            >
              <td style={{ padding: '4px 8px', color: '#858585', fontFamily: 'monospace' }}>
                {formatTime(log.timestamp_iso)}
              </td>
              <td style={{ padding: '4px 8px' }}>{log.server_name}</td>
              <td
                style={{
                  padding: '4px 8px',
                  color: log.direction === 'request' ? '#4ec9b0' : '#ce9178',
                }}
              >
                {log.direction}
              </td>
              <td style={{ padding: '4px 8px', color: '#dcdcaa' }}>{log.method || '-'}</td>
              <td style={{ padding: '4px 8px', color: getStatusColor(log.status) }}>
                {log.status || '-'}
              </td>
              <td style={{ padding: '4px 8px', textAlign: 'right', color: '#858585' }}>
                {log.duration_ms ? `${log.duration_ms.toFixed(2)}ms` : '-'}
              </td>
              <td style={{ padding: '4px 8px', textAlign: 'right', color: '#858585' }}>
                {log.payload_size ? `${(log.payload_size / 1024).toFixed(1)}KB` : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LogTable;
