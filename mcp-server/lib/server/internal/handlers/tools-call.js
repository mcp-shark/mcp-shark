import { getBy } from '../../external/kv.js';
import { InternalServerError } from './error.js';

const isAsyncIterable = (v) => v && typeof v[Symbol.asyncIterator] === 'function';

export function createToolsCallHandler(logger, mcpServers, requestedMcpServer) {
  return async (req) => {
    const path = req.path;
    const { name, arguments: args } = req.params;
    logger.debug('Tool call', path, name, args);

    const callTool = getBy(mcpServers, requestedMcpServer, name, 'callTool', args || {});
    if (!callTool) {
      throw new InternalServerError(`Tool not found: ${name}`);
    }

    const result = await callTool({
      ...req.params,
      name,
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
