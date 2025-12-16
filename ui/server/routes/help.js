import { readHelpState, writeHelpState } from 'mcp-shark-common/configs/index.js';

export function createHelpRoutes() {
  const router = {};

  router.getState = (_req, res) => {
    const state = readHelpState();
    res.json({
      dismissed: state.dismissed || false,
      tourCompleted: state.tourCompleted || false,
    });
  };

  router.dismiss = (req, res) => {
    const { tourCompleted } = req.body || {};
    const state = {
      dismissed: true,
      tourCompleted: tourCompleted || false,
    };
    const success = writeHelpState(state);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to save help state' });
    }
  };

  router.reset = (_req, res) => {
    const state = {
      dismissed: false,
      tourCompleted: false,
      dismissedAt: null,
    };
    const success = writeHelpState(state);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to reset help state' });
    }
  };

  return router;
}
