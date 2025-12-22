import { StatusCodes } from '#core/constants';

/**
 * Controller for Smart Scan token HTTP endpoints
 */
export class TokenController {
  constructor(tokenService, logger) {
    this.tokenService = tokenService;
    this.logger = logger;
  }

  getToken = (_req, res) => {
    try {
      const token = this.tokenService.readToken();
      return res.json({
        success: true,
        token: token || null,
      });
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Error reading Smart Scan token');
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to read token',
        message: error.message,
      });
    }
  };

  saveToken = (req, res) => {
    try {
      const { token } = req.body;

      if (token === undefined) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Token is required',
        });
      }

      const success = this.tokenService.writeToken(token);

      if (!success) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: 'Failed to save token',
        });
      }

      return res.json({
        success: true,
        message: 'Token saved successfully',
      });
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Error saving Smart Scan token');
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to save token',
        message: error.message,
      });
    }
  };
}
