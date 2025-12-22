import {
  ListPromptsResultSchema,
  ListResourcesResultSchema,
  ListToolsResultSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { CompositeError } from '#core/libraries/ErrorLibrary.js';
const METHOD_NOT_FOUND_CODE = '-32601';

export class RequestError extends CompositeError {
  constructor(message, error) {
    super('RequestError', message, error);
  }
}

function isMethodNotFound(error) {
  return error?.code?.toString() === METHOD_NOT_FOUND_CODE;
}

async function getListOf(client, typeOfList, schema) {
  const fetchedList = {
    [typeOfList]: [],
  };
  try {
    const result = await client.request({ method: `${typeOfList}/list` }, schema);
    fetchedList[typeOfList] = result[typeOfList];
    return fetchedList;
  } catch (error) {
    if (isMethodNotFound(error)) {
      return fetchedList;
    }
    return new RequestError(`Failed to list ${typeOfList}`, error);
  }
}

export function listTools(client) {
  return getListOf(client, 'tools', ListToolsResultSchema);
}

export function listResources(client) {
  return getListOf(client, 'resources', ListResourcesResultSchema);
}

export function listPrompts(client) {
  return getListOf(client, 'prompts', ListPromptsResultSchema);
}
