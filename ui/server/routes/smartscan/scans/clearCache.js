import { HttpStatus } from '#core/constants';
import logger from '#ui/server/utils/logger.js';
import { clearAllScanResults } from '#ui/server/utils/scan-cache.js';

/**
 * Clear all cached scan results
 * POST /api/smartscan/cache/clear
 */
export function clearCache(_req, res) {
  try {
    const deletedCount = clearAllScanResults();
    return res.json({
      success: true,
      message: `Cleared ${deletedCount} cached scan result${deletedCount !== 1 ? 's' : ''}`,
      deletedCount,
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Error clearing cache');
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to clear cache',
      message: error.message,
    });
  }
}
