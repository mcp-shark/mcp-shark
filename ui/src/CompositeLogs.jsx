import { useState, useEffect, useRef } from 'react';
import { colors, fonts } from './theme';

function CompositeLogs() {
  const [logs, setLogs] = useState([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState('');
  const [logType, setLogType] = useState('all'); // all, stdout, stderr, error, exit
  const logEndRef = useRef(null);
  const wsRef = useRef(null);

  const scrollToTop = () => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    scrollToTop();
  }, [logs, autoScroll]);

  const loadLogs = async () => {
    try {
      const response = await fetch('/api/composite/logs?limit=5000');
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  };

  useEffect(() => {
    loadLogs();

    const wsUrl = import.meta.env.DEV
      ? 'ws://localhost:9853'
      : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected for logs');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'log') {
          setLogs((prev) => {
            // Add new log at the beginning (latest first)
            const newLogs = [msg.data, ...prev];
            // Keep only last 5000 in memory
            return newLogs.slice(0, 5000);
          });
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket closed, attempting to reconnect...');
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CLOSED) {
          // Reconnect logic would go here, but for now just log
          console.log('WebSocket reconnection needed');
        }
      }, 3000);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, []);

  const clearLogs = async () => {
    try {
      await fetch('/api/composite/logs/clear', { method: 'POST' });
      setLogs([]);
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'stderr':
      case 'error':
        return colors.error;
      case 'stdout':
        return colors.textPrimary;
      case 'exit':
        return colors.accentOrange;
      default:
        return colors.textSecondary;
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (logType !== 'all' && log.type !== logType) return false;
    if (filter && !log.line.toLowerCase().includes(filter.toLowerCase())) return false;
    return true;
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        background: colors.bgPrimary,
        overflow: 'hidden',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${colors.borderLight}`,
          background: colors.bgCard,
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          flexWrap: 'wrap',
          boxShadow: `0 1px 3px ${colors.shadowSm}`,
        }}
      >
        <input
          type="text"
          placeholder="🔍 Filter logs..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            background: colors.bgSecondary,
            border: `1px solid ${colors.borderLight}`,
            color: colors.textPrimary,
            fontSize: '13px',
            fontFamily: fonts.body,
            width: '300px',
            borderRadius: '6px',
            transition: 'all 0.2s',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = colors.accentBlue;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.accentBlue}20`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = colors.borderLight;
            e.currentTarget.style.boxShadow = 'none';
          }}
        />

        <select
          value={logType}
          onChange={(e) => setLogType(e.target.value)}
          style={{
            padding: '8px 12px',
            background: colors.bgSecondary,
            border: `1px solid ${colors.borderLight}`,
            color: colors.textPrimary,
            fontSize: '13px',
            fontFamily: fonts.body,
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = colors.accentBlue;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.accentBlue}20`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = colors.borderLight;
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <option value="all">All Types</option>
          <option value="stdout">Stdout</option>
          <option value="stderr">Stderr</option>
          <option value="error">Errors</option>
          <option value="exit">Exit</option>
        </select>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.textPrimary,
            fontSize: '13px',
            fontFamily: fonts.body,
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          Auto-scroll
        </label>

        <button
          onClick={clearLogs}
          style={{
            padding: '8px 14px',
            background: colors.buttonDanger,
            border: 'none',
            color: colors.textInverse,
            fontSize: '12px',
            fontFamily: fonts.body,
            fontWeight: '500',
            cursor: 'pointer',
            borderRadius: '6px',
            transition: 'all 0.2s',
            boxShadow: `0 2px 4px ${colors.shadowSm}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.buttonDangerHover;
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.buttonDanger;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Clear Logs
        </button>

        <button
          onClick={async () => {
            try {
              const response = await fetch('/api/composite/logs/export');
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `mcp-shark-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            } catch (error) {
              console.error('Failed to export logs:', error);
            }
          }}
          style={{
            padding: '8px 14px',
            background: colors.buttonPrimary,
            border: 'none',
            color: colors.textInverse,
            fontSize: '12px',
            fontFamily: fonts.body,
            fontWeight: '500',
            cursor: 'pointer',
            borderRadius: '6px',
            transition: 'all 0.2s',
            boxShadow: `0 2px 4px ${colors.shadowSm}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.buttonPrimaryHover;
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.buttonPrimary;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Export Logs
        </button>

        <div
          style={{
            marginLeft: 'auto',
            color: colors.textSecondary,
            fontSize: '12px',
            fontFamily: fonts.body,
          }}
        >
          {filteredLogs.length} / {logs.length} lines
        </div>
      </div>

      {/* Logs */}
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
    </div>
  );
}

export default CompositeLogs;
