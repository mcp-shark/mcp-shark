export function createRequestsRoutes(container) {
  const requestService = container.getService('request');
  const logger = container.getLibrary('logger');

  const router = {};

  router.getRequests = (req, res) => {
    try {
      const requests = requestService.getRequests(req.query);
      res.json(requests);
    } catch (error) {
      logger.error({ error: error.message }, 'Error in getRequests');
      res.status(500).json({ error: 'Failed to query requests', details: error.message });
    }
  };

  router.getRequest = (req, res) => {
    try {
      const request = requestService.getRequest(req.params.frameNumber);
      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }
      res.json(request);
    } catch (error) {
      logger.error({ error: error.message }, 'Error in getRequest');
      res.status(500).json({ error: 'Failed to get request', details: error.message });
    }
  };

  router.clearRequests = (_req, res) => {
    try {
      const result = requestService.clearRequests();
      res.json(result);
    } catch (error) {
      logger.error({ error: error.message }, 'Error clearing requests');
      res.status(500).json({ error: 'Failed to clear traffic', details: error.message });
    }
  };

  router.exportRequests = (req, res) => {
    try {
      const format = req.query.format || 'json';
      const { content, contentType, extension } = requestService.exportRequests(req.query, format);

      const filename = `mcp-shark-traffic-${new Date().toISOString().replace(/[:.]/g, '-')}.${extension}`;
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(content);
    } catch (error) {
      logger.error({ error: error.message }, 'Error exporting requests');
      res.status(500).json({ error: 'Failed to export traffic', details: error.message });
    }
  };

  return router;
}
