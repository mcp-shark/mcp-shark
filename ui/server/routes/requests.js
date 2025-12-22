import { RequestController } from '../controllers/RequestController.js';

export function createRequestsRoutes(container) {
  const requestService = container.getService('request');
  const exportService = container.getService('export');
  const serializationLib = container.getLibrary('serialization');
  const logger = container.getLibrary('logger');

  const controller = new RequestController(requestService, exportService, serializationLib, logger);

  const router = {};

  router.getRequests = (req, res) => controller.getRequests(req, res);
  router.getRequest = (req, res) => controller.getRequest(req, res);
  router.clearRequests = (req, res) => controller.clearRequests(req, res);
  router.exportRequests = (req, res) => controller.exportRequests(req, res);

  return router;
}
