import { AauthController } from '../controllers/AauthController.js';

export function createAauthRoutes(container) {
  const requestService = container.getService('request');
  const auditService = container.getService('audit');
  const logger = container.getLibrary('logger');

  const controller = new AauthController(requestService, auditService, logger);

  return {
    getPosture: (req, res) => controller.getPosture(req, res),
    getMissions: (req, res) => controller.getMissions(req, res),
    getGraph: (req, res) => controller.getGraph(req, res),
    getUpstreams: (req, res) => controller.getUpstreams(req, res),
    getNodePackets: (req, res) => controller.getNodePackets(req, res),
    runSelfTest: (req, res) => controller.runSelfTest(req, res),
  };
}
