import { Defaults, HttpStatus } from '#core/constants';

/**
 * Controller for log-related HTTP endpoints
 */
export class LogController {
  constructor(logService, logger) {
    this.logService = logService;
    this.logger = logger;
  }

  getLogs = (req, res) => {
    try {
      const limit = Number.parseInt(req.query.limit) || Defaults.DEFAULT_LIMIT;
      const offset = Number.parseInt(req.query.offset) || 0;
      const logs = this.logService.getLogs({ limit, offset });
      res.json(logs);
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Error getting logs');
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to get logs',
        details: error.message,
      });
    }
  };

  clearLogs = (_req, res) => {
    try {
      const result = this.logService.clearLogs();
      res.json(result);
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Error clearing logs');
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to clear logs',
        details: error.message,
      });
    }
  };

  exportLogs = (_req, res) => {
    try {
      const logsText = this.logService.exportLogs();
      const filename = `mcp-shark-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(logsText);
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Error exporting logs');
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to export logs',
        details: error.message,
      });
    }
  };
}
