const API_BASE_URL = 'https://smart.mcpshark.sh';

/**
 * Proxy POST request to create a scan
 * POST /api/smartscan/scans
 */
export async function createScan(req, res) {
  try {
    const { apiToken, scanData } = req.body;

    if (!apiToken) {
      return res.status(400).json({
        error: 'API token is required',
      });
    }

    if (!scanData) {
      return res.status(400).json({
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
    console.error('Smart Scan API error:', error);
    return res.status(500).json({
      error: 'Failed to create scan',
      message: error.message,
    });
  }
}
