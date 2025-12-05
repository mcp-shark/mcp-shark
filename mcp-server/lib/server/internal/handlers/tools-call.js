import { getBy, extractName } from '../../external/kv.js';
import { InternalServerError } from './error.js';

const isAsyncIterable = v => v && typeof v[Symbol.asyncIterator] === 'function';

export function createToolsCallHandler(logger, mcpServers) {
  return async req => {
    const path = req.path;
    const { name, arguments: args } = req.params;
    logger.debug('Tool call', path, name, args);

    // Extract real server name from concatenated name
    const { typeName } = extractName(name);

    const callTool = getBy(mcpServers, name, 'callTool', args || {});
    if (!callTool) {
      throw new InternalServerError(`Tool not found: ${name}`);
    }

    const result = await callTool({
      ...req.params,
      name: typeName,
    });
    logger.debug('Tool call result', result);

    if (isAsyncIterable(result)) {
      async function* loggedStream() {
        for await (const chunk of result) {
          logger.debug('Tool call chunk forwarded', chunk);
          yield chunk;
        }
      }
      return loggedStream();
    }

    return result;
  };
}
