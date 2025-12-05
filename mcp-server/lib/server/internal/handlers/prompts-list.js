import { listAll } from '../../external/kv.js';

export function createPromptsListHandler(logger, mcpServers) {
  return async req => {
    const path = req.path;
    logger.debug('Prompts list', path);

    const res = await listAll(mcpServers, 'prompts');
    const result = Array.isArray(res) ? { prompts: res } : res;

    return result;
  };
}
