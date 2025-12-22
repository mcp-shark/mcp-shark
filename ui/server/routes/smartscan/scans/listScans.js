import { HttpStatus } from '#core/constants';
import logger from '#ui/server/utils/logger.js';
import { getAllCachedScanResults } from '#ui/server/utils/scan-cache.js';

/**
 * List all scans from local cache only
 * GET /api/smartscan/scans?cache=true
 */
export async function listScans(_req, res) {
  try {
    logger.info('Loading cached scans from local storage');
    const cachedScans = getAllCachedScanResults();
    logger.info({ count: cachedScans.length }, 'Returning cached scans');
    return res.json({
      scans: cachedScans,
      cached: true,
      count: cachedScans.length,
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Error loading cached scans');
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to load cached scans',
      message: error.message,
    });
  }
}
