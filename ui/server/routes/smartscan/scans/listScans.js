import logger from '../../../utils/logger.js';
import { getAllCachedScanResults } from '../../../utils/scan-cache.js';

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
    return res.status(500).json({
      error: 'Failed to load cached scans',
      message: error.message,
    });
  }
}
