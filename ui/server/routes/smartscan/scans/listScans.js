import { getAllCachedScanResults } from '../../../utils/scan-cache.js';

/**
 * List all scans from local cache only
 * GET /api/smartscan/scans?cache=true
 */
export async function listScans(_req, res) {
  try {
    console.log('[listScans] Loading cached scans from local storage...');
    const cachedScans = getAllCachedScanResults();
    console.log(`[listScans] Returning ${cachedScans.length} cached scans`);
    return res.json({
      scans: cachedScans,
      cached: true,
      count: cachedScans.length,
    });
  } catch (error) {
    console.error('[listScans] Error loading cached scans:', error);
    return res.status(500).json({
      error: 'Failed to load cached scans',
      message: error.message,
    });
  }
}
