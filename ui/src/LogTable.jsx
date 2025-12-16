import { colors, fonts } from './theme';

function LogTable({ logs, selected, onSelect }) {
  const getStatusColor = (status) => {
    if (status === 'error') {
      return colors.error;
    }
    if (status === 'success') {
      return colors.success;
    }
    if (status === 'pending') {
      return colors.warning;
    }
    return colors.textTertiary;
  };

  const formatTime = (iso) => {
    return new Date(iso).toLocaleTimeString();
  };

  return (
    <div style={{ flex: 1, overflow: 'auto', background: colors.bgPrimary }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '12px',
          fontFamily: fonts.body,
        }}
      >
        <thead
          style={{
            position: 'sticky',
            top: 0,
            background: colors.bgCard,
            zIndex: 1,
            boxShadow: `0 2px 4px ${colors.shadowSm}`,
          }}
        >
          <tr>
            <th
              style={{
                padding: '12px 16px',
                textAlign: 'left',
                borderBottom: `1px solid ${colors.borderLight}`,
                color: colors.textSecondary,
                fontWeight: '600',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: colors.bgCard,
              }}
            >
              Time
            </th>
            <th
              style={{
                padding: '12px 16px',
                textAlign: 'left',
                borderBottom: `1px solid ${colors.borderLight}`,
                color: colors.textSecondary,
                fontWeight: '600',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: colors.bgCard,
              }}
            >
              Server
            </th>
            <th
              style={{
                padding: '12px 16px',
                textAlign: 'left',
                borderBottom: `1px solid ${colors.borderLight}`,
                color: colors.textSecondary,
                fontWeight: '600',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: colors.bgCard,
              }}
            >
              Dir
            </th>
            <th
              style={{
                padding: '12px 16px',
                textAlign: 'left',
                borderBottom: `1px solid ${colors.borderLight}`,
                color: colors.textSecondary,
                fontWeight: '600',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: colors.bgCard,
              }}
            >
              Method
            </th>
            <th
              style={{
                padding: '12px 16px',
                textAlign: 'left',
                borderBottom: `1px solid ${colors.borderLight}`,
                color: colors.textSecondary,
                fontWeight: '600',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: colors.bgCard,
              }}
            >
              Status
            </th>
            <th
              style={{
                padding: '12px 16px',
                textAlign: 'right',
                borderBottom: `1px solid ${colors.borderLight}`,
                color: colors.textSecondary,
                fontWeight: '600',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: colors.bgCard,
              }}
            >
              Duration
            </th>
            <th
              style={{
                padding: '12px 16px',
                textAlign: 'right',
                borderBottom: `1px solid ${colors.borderLight}`,
                color: colors.textSecondary,
                fontWeight: '600',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: colors.bgCard,
              }}
            >
              Size
            </th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr
              key={log.id}
              onClick={() => onSelect(log)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(log);
                }
              }}
              tabIndex={0}
              aria-label={`Select log entry ${log.id}`}
              style={{
                cursor: 'pointer',
                background: selected?.id === log.id ? colors.bgSelected : colors.bgCard,
                borderBottom: `1px solid ${colors.borderLight}`,
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (selected?.id !== log.id) e.currentTarget.style.background = colors.bgHover;
              }}
              onMouseLeave={(e) => {
                if (selected?.id !== log.id) e.currentTarget.style.background = colors.bgCard;
              }}
            >
              <td
                style={{
                  padding: '16px',
                  color: colors.textTertiary,
                  fontFamily: fonts.mono,
                  fontSize: '12px',
                }}
              >
                {formatTime(log.timestamp_iso)}
              </td>
              <td
                style={{
                  padding: '16px',
                  color: colors.textPrimary,
                  fontSize: '12px',
                  fontFamily: fonts.body,
                }}
              >
                {log.server_name}
              </td>
              <td
                style={{
                  padding: '16px',
                  color: log.direction === 'request' ? colors.accentBlue : colors.accentOrange,
                  fontSize: '12px',
                  fontWeight: '500',
                  fontFamily: fonts.body,
                }}
              >
                {log.direction}
              </td>
              <td
                style={{
                  padding: '16px',
                  color: colors.textPrimary,
                  fontSize: '12px',
                  fontFamily: fonts.body,
                }}
              >
                {log.method || '-'}
              </td>
              <td
                style={{
                  padding: '16px',
                  color: getStatusColor(log.status),
                  fontSize: '12px',
                  fontWeight: '500',
                  fontFamily: fonts.body,
                }}
              >
                {log.status || '-'}
              </td>
              <td
                style={{
                  padding: '16px',
                  textAlign: 'right',
                  color: colors.textSecondary,
                  fontSize: '12px',
                  fontFamily: fonts.mono,
                }}
              >
                {log.duration_ms ? `${log.duration_ms.toFixed(2)}ms` : '-'}
              </td>
              <td
                style={{
                  padding: '16px',
                  textAlign: 'right',
                  color: colors.textSecondary,
                  fontSize: '12px',
                  fontFamily: fonts.mono,
                }}
              >
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
