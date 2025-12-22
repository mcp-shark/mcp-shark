const API_BASE_URL = 'https://smart.mcpshark.sh';
import { HttpStatus } from '#core/constants';
import logger from '#ui/server/utils/logger.js';

/**
 * Proxy POST request to create a scan
 * POST /api/smartscan/scans
 */
export async function createScan(req, res) {
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

    const response = await fetch(`${API_BASE_URL}/api/scans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify(scanData),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    logger.error({ error: error.message }, 'Smart Scan API error');
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to create scan',
      message: error.message,
    });
  }
}
