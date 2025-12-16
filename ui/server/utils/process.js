const MAX_LOG_LINES = 10000;

export function createLogEntry(mcpSharkLogs, broadcastLogUpdate) {
  return function logEntry(type, data) {
    const timestamp = new Date().toISOString();
    const line = data.toString();
    mcpSharkLogs.push({ timestamp, type, line });
    if (mcpSharkLogs.length > MAX_LOG_LINES) {
      mcpSharkLogs.shift();
    }
    broadcastLogUpdate({ timestamp, type, line });
  };
}
