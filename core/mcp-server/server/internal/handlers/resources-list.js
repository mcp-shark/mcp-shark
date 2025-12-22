import { listAll } from '../../external/kv.js';

async function handleResourcesList(req, logger, mcpServers, requestedMcpServer) {
  const path = req.path;
  logger.debug('Resources list', path);

  const res = await listAll(mcpServers, requestedMcpServer, 'resources');
  const result = Array.isArray(res) ? { resources: res } : res;

  return result;
}

function createResourcesListHandlerWrapper(req, logger, mcpServers, requestedMcpServer) {
  return handleResourcesList(req, logger, mcpServers, requestedMcpServer);
}

export function createResourcesListHandler(logger, mcpServers, requestedMcpServer) {
  return async (req) => {
    return createResourcesListHandlerWrapper(req, logger, mcpServers, requestedMcpServer);
  };
}
