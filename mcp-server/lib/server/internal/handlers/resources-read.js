import { getBy } from '../../external/kv.js';
import { InternalServerError } from './error.js';

export function createResourcesReadHandler(logger, mcpServers) {
  return async req => {
    const uri = req.params.uri;
    logger.debug('Resource read', uri);

    const readResource = getBy(mcpServers, uri, 'readResource');
    if (!readResource) {
      throw new InternalServerError(`Resource not found: ${uri}`);
    }

    const result = await readResource(uri);
    logger.debug('Resource read result', result);

    return result;
  };
}
