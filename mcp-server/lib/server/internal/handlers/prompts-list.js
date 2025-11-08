import { listAll } from '../../external/kv.js';

export function createPromptsListHandler(logger, mcpServers) {
  return async _req => {
    logger.debug('Prompts list');

    const res = await listAll(mcpServers, 'prompts');
    const result = Array.isArray(res) ? { prompts: res } : res;

    return result;
  };
}
