import { computeMcpHash, getCachedScanResult } from '../../../utils/scan-cache.js';

/**
 * Get cached scan results for discovered servers
 * POST /api/smartscan/cached-results
 */
export function getCachedResults(req, res) {
  try {
    const { servers } = req.body;

    if (!servers || !Array.isArray(servers) || servers.length === 0) {
      return res.status(400).json({
        error: 'Servers array is required',
      });
    }

    const cachedResults = servers.map((serverData) => {
      const hash = computeMcpHash(serverData);
      const cachedResult = getCachedScanResult(hash);

      if (cachedResult) {
        return {
          serverName: serverData.name,
          success: true,
          data: cachedResult,
          cached: true,
          hash,
        };
      }

      return {
        serverName: serverData.name,
        success: false,
        data: null,
        cached: false,
        hash,
      };
    });

    return res.json({
      success: true,
      results: cachedResults,
    });
  } catch (error) {
    console.error('Error getting cached results:', error);
    return res.status(500).json({
      error: 'Failed to get cached results',
      message: error.message,
    });
  }
}
