import { StatusCodes } from '#core/constants';

/**
 * Controller for settings HTTP endpoints
 */
export class SettingsController {
  constructor(settingsService, logger) {
    this.settingsService = settingsService;
    this.logger = logger;
  }

  getSettings = (_req, res) => {
    try {
      const settings = this.settingsService.getSettings();
      res.json(settings);
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Error getting settings');
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to get settings',
        details: error.message,
      });
    }
  };
}
