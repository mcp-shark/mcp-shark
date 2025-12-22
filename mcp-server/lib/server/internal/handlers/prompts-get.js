import { getBy } from '../../external/kv.js';
import { InternalServerError } from './error.js';

async function handlePromptsGet(req, logger, mcpServers, requestedMcpServer) {
  const name = req.params.name;
  const promptArgs = req?.params?.arguments || {};
  logger.debug('Prompt get', name, promptArgs);

  const getPrompt = getBy(mcpServers, requestedMcpServer, name, 'getPrompt', promptArgs);
  if (!getPrompt) {
    throw new InternalServerError(`Prompt not found: ${name}`);
  }

  const result = await getPrompt(name, promptArgs);
  logger.debug('Prompt get result', result);

  return result;
}

export function createPromptsGetHandler(logger, mcpServers, requestedMcpServer) {
  return async (req) => {
    return handlePromptsGet(req, logger, mcpServers, requestedMcpServer);
  };
}
