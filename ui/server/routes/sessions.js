export function createSessionsRoutes(container) {
  const sessionService = container.getService('session');
  const logger = container.getLibrary('logger');

  const router = {};

  router.getSessions = (req, res) => {
    try {
      const sessions = sessionService.getSessions(req.query);
      res.json(sessions);
    } catch (error) {
      logger.error({ error: error.message }, 'Error in getSessions');
      res.status(500).json({ error: 'Failed to query sessions', details: error.message });
    }
  };

  router.getSessionRequests = (req, res) => {
    try {
      const requests = sessionService.getSessionRequests(req.params.sessionId, req.query.limit);
      res.json(requests);
    } catch (error) {
      logger.error({ error: error.message }, 'Error in getSessionRequests');
      res.status(500).json({ error: 'Failed to get session requests', details: error.message });
    }
  };

  return router;
}
