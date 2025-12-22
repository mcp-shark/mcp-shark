import { CompositeError, getErrors, isError } from '#core/libraries/ErrorLibrary.js';
import { createClient } from './client.js';
import * as requests from './request.js';
import { makeTransport } from './transport.js';

export class RunError extends CompositeError {
  constructor(message, error, errors = []) {
    super('RunError', message, error);
    this.errors = errors;
  }
}

function createCallTool(client, args) {
  return client.callTool.bind(client)(args);
}

function createReadResource(client, resourceUri) {
  return client.readResource.bind(client)(resourceUri);
}

function createGetPrompt(client, promptName, args) {
  return client.getPrompt.bind(client)({
    name: promptName,
    arguments: args,
  });
}

export async function runExternalServer({ logger, name, config }) {
  logger.debug(`Starting external server run for server ${name} with config:`, config);

  // Create transport
  const transport = makeTransport(config);
  if (isError(transport)) {
    return new RunError(`Error creating transport for external server ${name}`, transport.error);
  }

  // Create client
  const client = await createClient({ transport });
  if (isError(client)) {
    return new RunError(`Error creating client for external server ${name}`, client.error);
  }

  // Run requests
  const allResults = [
    requests.listTools(client),
    requests.listResources(client),
    requests.listPrompts(client),
  ];
  const results = await Promise.allSettled(allResults);

  // Check for errors
  const errors = getErrors(results);
  if (errors.length > 0) {
    return new RunError(
      `Errors occurred while running requests for external server ${name}`,
      null,
      errors
    );
  }

  const [{ tools }, { resources }, { prompts }] = results.map((result) => result.value);

  return {
    name,
    client,
    tools,
    resources,
    prompts,
    callTool: (args) => createCallTool(client, args),
    readResource: (resourceUri) => createReadResource(client, resourceUri),
    getPrompt: (promptName, args) => createGetPrompt(client, promptName, args),
  };
}
