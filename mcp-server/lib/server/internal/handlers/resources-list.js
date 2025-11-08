import { listAll } from '../../external/kv.js';

export function createResourcesListHandler(logger, mcpServers) {
  return async _req => {
    logger.debug('Resources list');

    const res = await listAll(mcpServers, 'resources');
    const result = Array.isArray(res) ? { resources: res } : res;

    return result;
  };
}
