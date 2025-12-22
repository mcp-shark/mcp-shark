import { HttpStatus } from '#core/constants';
import logger from '#ui/server/utils/logger.js';
import { readSmartScanToken, writeSmartScanToken } from '#ui/server/utils/smartscan-token.js';

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
    logger.error({ error: error.message }, 'Error reading Smart Scan token');
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
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
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: 'Token is required',
      });
    }

    const success = writeSmartScanToken(token);

    if (!success) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to save token',
      });
    }

    return res.json({
      success: true,
      message: 'Token saved successfully',
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Error saving Smart Scan token');
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to save token',
      message: error.message,
    });
  }
}
