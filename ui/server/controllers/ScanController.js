import { StatusCodes } from '#core/constants/index.js';
import { handleError, handleValidationError } from '../utils/errorHandler.js';

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
        return handleValidationError('API token is required', res, this.logger);
      }

      if (!scanData) {
        return handleValidationError('Scan data is required', res, this.logger);
      }

      const result = await this.scanService.createScan(scanData, apiToken);
      return res.status(result.status).json(result.data || { error: result.error });
    } catch (error) {
      handleError(error, res, this.logger, 'Smart Scan API error');
    }
  };

  createBatchScans = async (req, res) => {
    try {
      const { apiToken, servers } = req.body;

      if (!apiToken) {
        return handleValidationError('API token is required', res, this.logger);
      }

      if (!servers || !Array.isArray(servers) || servers.length === 0) {
        return handleValidationError('Servers array is required', res, this.logger);
      }

      const results = await this.scanService.createBatchScans(servers, apiToken);
      return res.json({
        success: true,
        results,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Smart Scan batch API error');
    }
  };

  getScan = async (req, res) => {
    try {
      const { scanId } = req.params;
      const apiToken = req.headers.authorization?.replace('Bearer ', '');

      if (!apiToken) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: 'API token is required',
        });
      }

      if (!scanId) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Scan ID is required',
        });
      }

      const result = await this.scanService.getScan(scanId, apiToken);
      return res.status(result.status).json(result.data || { error: result.error });
    } catch (error) {
      handleError(error, res, this.logger, 'Smart Scan API error');
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
      handleError(error, res, this.logger, 'Error loading cached scans');
    }
  };

  getCachedResults = (req, res) => {
    try {
      const { servers } = req.body;

      if (!servers || !Array.isArray(servers) || servers.length === 0) {
        return handleValidationError('Servers array is required', res, this.logger);
      }

      const results = this.scanService.getCachedResults(servers);
      return res.json({
        success: true,
        results,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error getting cached results');
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
      handleError(error, res, this.logger, 'Error clearing cache');
    }
  };
}
