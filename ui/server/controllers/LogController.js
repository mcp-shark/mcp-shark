import { Defaults } from '#core/constants';
import { handleError } from '../utils/errorHandler.js';

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
      handleError(error, res, this.logger, 'Error getting logs');
    }
  };

  clearLogs = (_req, res) => {
    try {
      const result = this.logService.clearLogs();
      res.json(result);
    } catch (error) {
      handleError(error, res, this.logger, 'Error clearing logs');
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
      handleError(error, res, this.logger, 'Error exporting logs');
    }
  };
}
