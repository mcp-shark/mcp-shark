import { LoggerLibrary } from '#core/libraries/LoggerLibrary.js';

/**
 * Bootstrap logger instance for use before DI container is available
 * Re-exports LoggerLibrary instance for backward compatibility
 * In core architecture, use LoggerLibrary via DependencyContainer
 */
const loggerInstance = new LoggerLibrary();

const logger = {
  info: (...args) => loggerInstance.info(...args),
  error: (...args) => loggerInstance.error(...args),
  warn: (...args) => loggerInstance.warn(...args),
  debug: (...args) => loggerInstance.debug(...args),
  log: (...args) => loggerInstance.log(...args),
  consola: loggerInstance.consola,
};

export default logger;
