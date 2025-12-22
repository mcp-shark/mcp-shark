/**
 * Library for logging utilities
 * Wraps the logger to be injectable
 * Pure utility - no dependencies on services or repositories
 */
import logger from '#common/logger';

export class LoggerLibrary {
  constructor() {
    this.logger = logger;
  }

  info(...args) {
    return this.logger.info(...args);
  }

  error(...args) {
    return this.logger.error(...args);
  }

  warn(...args) {
    return this.logger.warn(...args);
  }

  debug(...args) {
    return this.logger.debug(...args);
  }

  log(...args) {
    return this.logger.log(...args);
  }
}
