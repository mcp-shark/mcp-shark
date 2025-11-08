import { useState, useEffect, useRef } from 'react';

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

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'log') {
        setLogs((prev) => {
          // Add new log at the beginning (latest first)
          const newLogs = [msg.data, ...prev];
          // Keep only last 5000 in memory
          return newLogs.slice(0, 5000);
        });
      }
    };

    return () => ws.close();
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
        return '#f48771';
      case 'stdout':
        return '#d4d4d4';
      case 'exit':
        return '#dcdcaa';
      default:
        return '#858585';
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (logType !== 'all' && log.type !== logType) return false;
    if (filter && !log.line.toLowerCase().includes(filter.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#1e1e1e' }}>
      {/* Toolbar */}
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid #3e3e42',
          background: '#252526',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <input
          type="text"
          placeholder="🔍 Filter logs..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '4px 8px',
            background: '#1e1e1e',
            border: '1px solid #3e3e42',
            color: '#d4d4d4',
            fontSize: '12px',
            fontFamily: 'monospace',
            width: '300px',
          }}
        />

        <select
          value={logType}
          onChange={(e) => setLogType(e.target.value)}
          style={{
            padding: '4px 8px',
            background: '#1e1e1e',
            border: '1px solid #3e3e42',
            color: '#d4d4d4',
            fontSize: '12px',
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
            gap: '6px',
            color: '#d4d4d4',
            fontSize: '12px',
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
            padding: '4px 12px',
            background: '#5f1e1e',
            border: '1px solid #7f3e3e',
            color: '#f48771',
            fontSize: '12px',
            cursor: 'pointer',
            borderRadius: '3px',
          }}
        >
          Clear Logs
        </button>

        <div style={{ marginLeft: 'auto', color: '#858585', fontSize: '11px' }}>
          {filteredLogs.length} / {logs.length} lines
        </div>
      </div>

      {/* Logs */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '8px',
          fontFamily: 'monospace',
          fontSize: '12px',
          background: '#1e1e1e',
        }}
      >
        {filteredLogs.length === 0 ? (
          <div style={{ color: '#858585', padding: '20px', textAlign: 'center' }}>
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
                  padding: '2px 0',
                  borderBottom: '1px solid #2d2d30',
                }}
              >
                <span style={{ color: '#858585', minWidth: '180px', flexShrink: 0 }}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span
                  style={{
                    color: '#858585',
                    minWidth: '60px',
                    flexShrink: 0,
                    textTransform: 'uppercase',
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

