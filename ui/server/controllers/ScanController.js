import { HttpStatus } from '#core/constants';

/**
 * Controller for Smart Scan HTTP endpoints
 */
export class ScanController {
  constructor(scanService, scanCacheService, logger) {
    this.scanService = scanService;
    this.scanCacheService = scanCacheService;
    this.logger = logger;
  }

  createScan = async (req, res) => {
    try {
      const { apiToken, scanData } = req.body;

      if (!apiToken) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'API token is required',
        });
      }

      if (!scanData) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Scan data is required',
        });
      }

      const result = await this.scanService.createScan(scanData, apiToken);
      return res.status(result.status).json(result.data || { error: result.error });
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Smart Scan API error');
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to create scan',
        message: error.message,
      });
    }
  };

  createBatchScans = async (req, res) => {
    try {
      const { apiToken, servers } = req.body;

      if (!apiToken) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'API token is required',
        });
      }

      if (!servers || !Array.isArray(servers) || servers.length === 0) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Servers array is required',
        });
      }

      const results = await this.scanService.createBatchScans(servers, apiToken);
      return res.json({
        success: true,
        results,
      });
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Smart Scan batch API error');
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to create batch scans',
        message: error.message,
      });
    }
  };

  getScan = async (req, res) => {
    try {
      const { scanId } = req.params;
      const apiToken = req.headers.authorization?.replace('Bearer ', '');

      if (!apiToken) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          error: 'API token is required',
        });
      }

      if (!scanId) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Scan ID is required',
        });
      }

      const result = await this.scanService.getScan(scanId, apiToken);
      return res.status(result.status).json(result.data || { error: result.error });
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Smart Scan API error');
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to get scan',
        message: error.message,
      });
    }
  };

  listScans = (_req, res) => {
    try {
      const cachedScans = this.scanCacheService.getAllCachedScanResults();
      return res.json({
        scans: cachedScans,
        cached: true,
        count: cachedScans.length,
      });
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Error loading cached scans');
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to load cached scans',
        message: error.message,
      });
    }
  };

  getCachedResults = (req, res) => {
    try {
      const { servers } = req.body;

      if (!servers || !Array.isArray(servers) || servers.length === 0) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Servers array is required',
        });
      }

      const results = this.scanService.getCachedResults(servers);
      return res.json({
        success: true,
        results,
      });
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Error getting cached results');
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to get cached results',
        message: error.message,
      });
    }
  };

  clearCache = (_req, res) => {
    try {
      const deletedCount = this.scanCacheService.clearAllScanResults();
      return res.json({
        success: true,
        message: `Cleared ${deletedCount} cached scan result${deletedCount !== 1 ? 's' : ''}`,
        deletedCount,
      });
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Error clearing cache');
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to clear cache',
        message: error.message,
      });
    }
  };
}
