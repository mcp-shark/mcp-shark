import { colors, fonts } from '../theme';

export default function LogsDisplay({ logs, filteredLogs, logEndRef, getLogColor }) {
  return (
    <div
      style={{
        flex: 1,
        overflow: 'auto',
        padding: '12px',
        fontFamily: fonts.mono,
        fontSize: '12px',
        background: colors.bgPrimary,
      }}
    >
      {filteredLogs.length === 0 ? (
        <div
          style={{
            color: colors.textSecondary,
            padding: '40px',
            textAlign: 'center',
            fontFamily: fonts.body,
          }}
        >
          {logs.length === 0
            ? 'No logs available. Start the MCP Shark server to see logs here.'
            : 'No logs match the current filter.'}
        </div>
      ) : (
        <>
          <div ref={logEndRef} />
          {filteredLogs.map((log, index) => (
            <div
              key={`${log.timestamp}-${index}`}
              style={{
                display: 'flex',
                gap: '12px',
                padding: '6px 8px',
                borderBottom: `1px solid ${colors.borderLight}`,
              }}
            >
              <span style={{ color: colors.textSecondary, minWidth: '180px', flexShrink: 0 }}>
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span
                style={{
                  color: colors.textSecondary,
                  minWidth: '60px',
                  flexShrink: 0,
                  textTransform: 'uppercase',
                  fontFamily: fonts.body,
                  fontSize: '11px',
                }}
              >
                [{log.type}]
              </span>
              <span
                style={{
                  color: getLogColor(log.type),
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  flex: 1,
                }}
              >
                {log.line}
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
