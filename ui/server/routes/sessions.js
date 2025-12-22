import { SessionController } from '../controllers/SessionController.js';

export function createSessionsRoutes(container) {
  const sessionService = container.getService('session');
  const serializationLib = container.getLibrary('serialization');
  const logger = container.getLibrary('logger');

  const controller = new SessionController(sessionService, serializationLib, logger);

  const router = {};

  router.getSessions = (req, res) => controller.getSessions(req, res);
  router.getSessionRequests = (req, res) => controller.getSessionRequests(req, res);

  return router;
}
