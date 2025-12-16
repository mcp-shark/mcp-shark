import { getServers } from './servers.js';
import { setup } from './setup.js';
import { getStatus } from './status.js';
import { stop } from './stop.js';

export function createCompositeRoutes(
  getMcpSharkProcess,
  setMcpSharkProcess,
  mcpSharkLogs,
  broadcastLogUpdate
) {
  const router = {};

  router.setup = async (req, res) => {
    return setup(
      req,
      res,
      getMcpSharkProcess,
      setMcpSharkProcess,
      mcpSharkLogs,
      broadcastLogUpdate
    );
  };

  router.stop = async (req, res, restoreOriginalConfig) => {
    return stop(
      req,
      res,
      restoreOriginalConfig,
      getMcpSharkProcess,
      setMcpSharkProcess,
      mcpSharkLogs,
      broadcastLogUpdate
    );
  };

  router.getStatus = (req, res) => {
    return getStatus(req, res, getMcpSharkProcess);
  };

  router.getServers = (req, res) => {
    return getServers(req, res);
  };

  return router;
}
