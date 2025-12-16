import { listAll } from '../../external/kv.js';

export function createToolsListHandler(logger, mcpServers, requestedMcpServer) {
  return async (req) => {
    const path = req.path;
    logger.debug('Listing tools', path);

    const res = await listAll(mcpServers, requestedMcpServer, 'tools');
    logger.debug('Tools list result', JSON.stringify(res));

    const result = Array.isArray(res) ? { tools: res } : res;

    return result;
  };
}
