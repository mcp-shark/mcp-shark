import { getBy } from '../../external/kv.js';
import { InternalServerError } from './error.js';

const isAsyncIterable = (v) => v && typeof v[Symbol.asyncIterator] === 'function';

async function* createLoggedStream(result, logger) {
  for await (const chunk of result) {
    logger.debug('Tool call chunk forwarded', chunk);
    yield chunk;
  }
}

async function handleToolsCall(req, logger, mcpServers, requestedMcpServer) {
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
    return createLoggedStream(result, logger);
  }

  return result;
}

function createToolsCallHandlerWrapper(req, logger, mcpServers, requestedMcpServer) {
  return handleToolsCall(req, logger, mcpServers, requestedMcpServer);
}

export function createToolsCallHandler(logger, mcpServers, requestedMcpServer) {
  return async (req) => {
    return createToolsCallHandlerWrapper(req, logger, mcpServers, requestedMcpServer);
  };
}
