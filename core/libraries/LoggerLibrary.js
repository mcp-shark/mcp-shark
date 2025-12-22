import { consola } from 'consola';

/**
 * Library for logging utilities
 * Pure utility - no dependencies on services or repositories
 * Uses consola with a consistent API supporting both Pino-style and consola-style
 */
export class LoggerLibrary {
  constructor() {
    this._consola = consola;
  }

  _formatArgs(args) {
    if (args.length === 0) {
      return null;
    }
    if (
      args.length === 2 &&
      typeof args[0] === 'object' &&
      args[0] !== null &&
      typeof args[1] === 'string'
    ) {
      return { style: 'pino', message: args[1] || '', metadata: args[0] };
    }
    return { style: 'consola', args };
  }

  info(...args) {
    const formatted = this._formatArgs(args);
    if (!formatted) {
      return;
    }
    if (formatted.style === 'pino') {
      consola.info(formatted.message, formatted.metadata);
    } else {
      consola.info(...formatted.args);
    }
  }

  error(...args) {
    const formatted = this._formatArgs(args);
    if (!formatted) {
      return;
    }
    if (formatted.style === 'pino') {
      consola.error(formatted.message, formatted.metadata);
    } else {
      consola.error(...formatted.args);
    }
  }

  warn(...args) {
    const formatted = this._formatArgs(args);
    if (!formatted) {
      return;
    }
    if (formatted.style === 'pino') {
      consola.warn(formatted.message, formatted.metadata);
    } else {
      consola.warn(...formatted.args);
    }
  }

  debug(...args) {
    const formatted = this._formatArgs(args);
    if (!formatted) {
      return;
    }
    if (formatted.style === 'pino') {
      consola.debug(formatted.message, formatted.metadata);
    } else {
      consola.debug(...formatted.args);
    }
  }

  log(...args) {
    const formatted = this._formatArgs(args);
    if (!formatted) {
      return;
    }
    if (formatted.style === 'pino') {
      consola.log(formatted.message, formatted.metadata);
    } else {
      consola.log(...formatted.args);
    }
  }

  get consola() {
    return this._consola;
  }
}
