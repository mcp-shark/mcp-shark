import { readSmartScanToken, writeSmartScanToken } from '../../utils/smartscan-token.js';

/**
 * Get stored Smart Scan token
 * GET /api/smartscan/token
 */
export function getToken(_req, res) {
  try {
    const token = readSmartScanToken();
    return res.json({
      success: true,
      token: token || null,
    });
  } catch (error) {
    console.error('Error reading Smart Scan token:', error);
    return res.status(500).json({
      error: 'Failed to read token',
      message: error.message,
    });
  }
}

/**
 * Save Smart Scan token
 * POST /api/smartscan/token
 */
export function saveToken(req, res) {
  try {
    const { token } = req.body;

    if (token === undefined) {
      return res.status(400).json({
        error: 'Token is required',
      });
    }

    const success = writeSmartScanToken(token);

    if (!success) {
      return res.status(500).json({
        error: 'Failed to save token',
      });
    }

    return res.json({
      success: true,
      message: 'Token saved successfully',
    });
  } catch (error) {
    console.error('Error saving Smart Scan token:', error);
    return res.status(500).json({
      error: 'Failed to save token',
      message: error.message,
    });
  }
}
