import { StatisticsController } from '../controllers/StatisticsController.js';

export function createStatisticsRoutes(container) {
  const statisticsService = container.getService('statistics');
  const serializationLib = container.getLibrary('serialization');
  const logger = container.getLibrary('logger');

  const controller = new StatisticsController(statisticsService, serializationLib, logger);

  const router = {};

  router.getStatistics = (req, res) => controller.getStatistics(req, res);

  return router;
}
