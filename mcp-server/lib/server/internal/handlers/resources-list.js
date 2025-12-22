import { listAll } from '../../external/kv.js';

async function handleResourcesList(req, logger, mcpServers, requestedMcpServer) {
  const path = req.path;
  logger.debug('Resources list', path);

  const res = await listAll(mcpServers, requestedMcpServer, 'resources');
  const result = Array.isArray(res) ? { resources: res } : res;

  return result;
}

export function createResourcesListHandler(logger, mcpServers, requestedMcpServer) {
  return async (req) => {
    return handleResourcesList(req, logger, mcpServers, requestedMcpServer);
  };
}
