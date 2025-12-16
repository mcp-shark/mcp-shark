import { useEffect, useRef, useState } from 'react';
import LogsDisplay from './components/LogsDisplay';
import LogsToolbar from './components/LogsToolbar';
import { colors } from './theme';

function CompositeLogs() {
  const [logs, setLogs] = useState([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState('');
  const [logType, setLogType] = useState('all'); // all, stdout, stderr, error, exit
  const logEndRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [autoScroll]);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const response = await fetch('/api/composite/logs?limit=5000');
        const data = await response.json();
        setLogs(data);
      } catch (error) {
        console.error('Failed to load logs:', error);
      }
    };

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
    if (logType !== 'all' && log.type !== logType) {
      return false;
    }
    if (filter && !log.line.toLowerCase().includes(filter.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleExportLogs = async () => {
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
  };

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
      <LogsToolbar
        filter={filter}
        setFilter={setFilter}
        logType={logType}
        setLogType={setLogType}
        autoScroll={autoScroll}
        setAutoScroll={setAutoScroll}
        onClearLogs={clearLogs}
        onExportLogs={handleExportLogs}
        filteredCount={filteredLogs.length}
        totalCount={logs.length}
      />
      <LogsDisplay
        logs={logs}
        filteredLogs={filteredLogs}
        logEndRef={logEndRef}
        getLogColor={getLogColor}
      />
    </div>
  );
}

export default CompositeLogs;
