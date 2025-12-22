export function createStatisticsRoutes(container) {
  const statisticsService = container.getService('statistics');
  const logger = container.getLibrary('logger');

  const router = {};

  router.getStatistics = (req, res) => {
    try {
      const stats = statisticsService.getStatistics(req.query);
      res.json(stats);
    } catch (error) {
      logger.error({ error: error.message }, 'Error in getStatistics');
      res.status(500).json({ error: 'Failed to get statistics', details: error.message });
    }
  };

  return router;
}
