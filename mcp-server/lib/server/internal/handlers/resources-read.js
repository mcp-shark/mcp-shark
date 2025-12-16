import { getBy } from '../../external/kv.js';
import { InternalServerError } from './error.js';

export function createResourcesReadHandler(logger, mcpServers, requestedMcpServer) {
  return async (req) => {
    const path = req.path;
    const uri = req.params.uri;
    logger.debug('Resource read', path, uri);

    const readResource = getBy(mcpServers, requestedMcpServer, uri, 'readResource');
    if (!readResource) {
      throw new InternalServerError(`Resource not found: ${uri}`);
    }

    const result = await readResource(uri);
    logger.debug('Resource read result', result);

    return result;
  };
}
