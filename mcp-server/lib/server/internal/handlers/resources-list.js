import { listAll } from '../../external/kv.js';

export function createResourcesListHandler(logger, mcpServers, requestedMcpServer) {
  return async (req) => {
    const path = req.path;
    logger.debug('Resources list', path);

    const res = await listAll(mcpServers, requestedMcpServer, 'resources');
    const result = Array.isArray(res) ? { resources: res } : res;

    return result;
  };
}
