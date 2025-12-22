import { StatusCodes } from '#core/constants';

/**
 * Get servers from config
 * Uses ConfigService via ConfigController
 */
export function getServers(container) {
  const configService = container.getService('config');
  const logger = container.getLibrary('logger');

  return (_req, res) => {
    try {
      const servers = configService.getServersFromConfig();
      res.json({ servers });
    } catch (error) {
      logger.error({ error: error.message }, 'Error getting servers');
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to get servers',
        details: error.message,
      });
    }
  };
}
