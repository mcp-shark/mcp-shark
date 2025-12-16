import { CompositeError, getErrors } from '../../common/error.js';
import { normalizeConfig } from './config.js';
import { buildKv } from './kv.js';
import { runExternalServer } from './single/run.js';

export class RunAllExternalServersError extends CompositeError {
  constructor(message, error, errors = []) {
    super('RunAllExternalServersError', message, error);
    this.errors = errors;
  }
}

export async function runAllExternalServers(logger, parsedConfig) {
  const configs = normalizeConfig(parsedConfig);
  const results = await Promise.all(
    Object.entries(configs).map(([name, config]) => runExternalServer({ logger, name, config }))
  );

  const flattenedResults = results.flat();
  const errors = getErrors(flattenedResults);
  if (errors.length > 0) {
    return new RunAllExternalServersError(
      'Errors occurred while running all external servers',
      null,
      errors
    );
  }

  const kv = buildKv(flattenedResults);
  return { kv, servers: flattenedResults };
}
