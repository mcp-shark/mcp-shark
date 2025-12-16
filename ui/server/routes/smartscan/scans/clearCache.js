import { clearAllScanResults } from '../../../utils/scan-cache.js';

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
    console.error('Error clearing cache:', error);
    return res.status(500).json({
      error: 'Failed to clear cache',
      message: error.message,
    });
  }
}
