import { listAll } from '../../external/kv.js';

export function createToolsListHandler(logger, mcpServers) {
  return async req => {
    logger.debug('Listing tools', req);

    const res = await listAll(mcpServers, 'tools');
    logger.debug('Tools list result', res);

    const result = Array.isArray(res) ? { tools: res } : res;

    return result;
  };
}
