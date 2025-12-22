import { Defaults } from '#core/constants/Defaults.js';

/**
 * Service for log management
 * Handles log storage, retrieval, and export
 */
export class LogService {
  constructor(logger) {
    this.logger = logger;
    this.logs = [];
  }

  /**
   * Initialize with log array (for compatibility with existing code)
   */
  initialize(logsArray) {
    this.logs = logsArray;
  }

  /**
   * Get logs with filters
   */
  getLogs(filters = {}) {
    const { limit = Defaults.DEFAULT_LIMIT, offset = 0 } = filters;
    return [...this.logs].reverse().slice(offset, offset + limit);
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs.length = 0;
    return { success: true, message: 'Logs cleared' };
  }

  /**
   * Export logs in text format
   */
  exportLogs() {
    const logsText = this.logs
      .map((log) => `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.line}`)
      .join('\n');

    return logsText;
  }

  /**
   * Add log entry
   */
  addLog(logEntry) {
    this.logs.push(logEntry);
    if (this.logs.length > Defaults.MAX_LOG_LINES) {
      this.logs.shift();
    }
    return logEntry;
  }

  /**
   * Get all logs (for internal use)
   */
  getAllLogs() {
    return this.logs;
  }
}
