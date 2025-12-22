import { listAll } from '../../external/kv.js';

async function handlePromptsList(req, logger, mcpServers, requestedMcpServer) {
  const path = req.path;
  logger.debug('Prompts list', path);

  const res = await listAll(mcpServers, requestedMcpServer, 'prompts');
  const result = Array.isArray(res) ? { prompts: res } : res;

  return result;
}

export function createPromptsListHandler(logger, mcpServers, requestedMcpServer) {
  return async (req) => {
    return handlePromptsList(req, logger, mcpServers, requestedMcpServer);
  };
}
