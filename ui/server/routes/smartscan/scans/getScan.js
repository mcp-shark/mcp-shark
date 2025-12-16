const API_BASE_URL = 'https://smart.mcpshark.sh';
import logger from '../../../utils/logger.js';

/**
 * Proxy GET request to get a scan by ID
 * GET /api/smartscan/scans/:scanId
 */
export async function getScan(req, res) {
  try {
    const { scanId } = req.params;
    const apiToken = req.headers.authorization?.replace('Bearer ', '');

    if (!apiToken) {
      return res.status(401).json({
        error: 'API token is required',
      });
    }

    if (!scanId) {
      return res.status(400).json({
        error: 'Scan ID is required',
      });
    }

    const response = await fetch(`${API_BASE_URL}/api/scans/${scanId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apiToken}`,
      },
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    logger.error({ error: error.message }, 'Smart Scan API error');
    return res.status(500).json({
      error: 'Failed to get scan',
      message: error.message,
    });
  }
}
