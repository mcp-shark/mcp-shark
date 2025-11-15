import { getBy, extractName } from '../../external/kv.js';
import { InternalServerError } from './error.js';

export function createPromptsGetHandler(logger, mcpServers) {
  return async req => {
    const name = req.params.name;
    const promptArgs = req?.params?.arguments || {};
    logger.debug('Prompt get', name, promptArgs);

    const { typeName } = extractName(name);

    const getPrompt = getBy(mcpServers, name, 'getPrompt', promptArgs);
    if (!getPrompt) {
      throw new InternalServerError(`Prompt not found: ${name}`);
    }

    const result = await getPrompt(typeName, promptArgs);
    logger.debug('Prompt get result', result);

    return result;
  };
}
