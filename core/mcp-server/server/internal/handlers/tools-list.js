import { listAll } from '../../external/kv.js';

async function handleToolsList(req, logger, mcpServers, requestedMcpServer) {
  const path = req.path;
  logger.debug('Listing tools', path);

  const res = await listAll(mcpServers, requestedMcpServer, 'tools');
  logger.debug('Tools list result', JSON.stringify(res));

  const result = Array.isArray(res) ? { tools: res } : res;

  return result;
}

function createToolsListHandlerWrapper(req, logger, mcpServers, requestedMcpServer) {
  return handleToolsList(req, logger, mcpServers, requestedMcpServer);
}

export function createToolsListHandler(logger, mcpServers, requestedMcpServer) {
  return async (req) => {
    return createToolsListHandlerWrapper(req, logger, mcpServers, requestedMcpServer);
  };
}
