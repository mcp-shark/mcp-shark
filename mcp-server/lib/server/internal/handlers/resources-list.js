import { listAll } from '../../external/kv.js';

export function createResourcesListHandler(logger, mcpServers) {
  return async req => {
    const path = req.path;
    logger.debug('Resources list', path);

    const res = await listAll(mcpServers, 'resources');
    const result = Array.isArray(res) ? { resources: res } : res;

    return result;
  };
}
