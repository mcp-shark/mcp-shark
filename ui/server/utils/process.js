import { Defaults } from '#core/constants/Defaults';

const MAX_LOG_LINES = Defaults.MAX_LOG_LINES;

function logEntry(mcpSharkLogs, broadcastLogUpdate, type, data) {
  const timestamp = new Date().toISOString();
  const line = data.toString();
  mcpSharkLogs.push({ timestamp, type, line });
  if (mcpSharkLogs.length > MAX_LOG_LINES) {
    mcpSharkLogs.shift();
  }
  broadcastLogUpdate({ timestamp, type, line });
}

export function createLogEntry(mcpSharkLogs, broadcastLogUpdate) {
  return (type, data) => logEntry(mcpSharkLogs, broadcastLogUpdate, type, data);
}
