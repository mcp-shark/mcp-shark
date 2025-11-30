import { colors, fonts } from '../theme';

export default function LogsDisplay({ logs, filteredLogs, logEndRef, getLogColor }) {
  return (
    <div
      style={{
        flex: 1,
        overflow: 'auto',
        padding: '16px',
        fontFamily: fonts.mono,
        fontSize: '12px',
        background: colors.bgCard,
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
                padding: '12px 16px',
                borderBottom: `1px solid ${colors.borderLight}`,
                background: colors.bgCard,
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.bgHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.bgCard;
              }}
            >
              <span
                style={{
                  color: colors.textTertiary,
                  minWidth: '140px',
                  flexShrink: 0,
                  fontFamily: fonts.mono,
                  fontSize: '11px',
                }}
              >
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span
                style={{
                  color: colors.textTertiary,
                  minWidth: '70px',
                  flexShrink: 0,
                  textTransform: 'uppercase',
                  fontFamily: fonts.body,
                  fontSize: '10px',
                  fontWeight: '600',
                  letterSpacing: '0.05em',
                }}
              >
                {log.type}
              </span>
              <span
                style={{
                  color: getLogColor(log.type),
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  flex: 1,
                  fontFamily: fonts.mono,
                  fontSize: '12px',
                  lineHeight: '1.5',
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
