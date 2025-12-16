import { consola } from 'consola';

/**
 * Unified logger for the entire codebase
 * Uses consola (already installed) with a consistent API
 * Supports both Pino-style API (object, message) and consola-style (multiple args)
 */
const logger = {
  info: (...args) => {
    if (args.length === 0) {
      return;
    }
    // If first arg is an object and second is a string, use Pino-style
    if (
      args.length === 2 &&
      typeof args[0] === 'object' &&
      args[0] !== null &&
      typeof args[1] === 'string'
    ) {
      consola.info(args[1] || '', args[0]);
    } else {
      // Otherwise, pass all args to consola (supports multiple strings/values)
      consola.info(...args);
    }
  },
  error: (...args) => {
    if (args.length === 0) {
      return;
    }
    if (
      args.length === 2 &&
      typeof args[0] === 'object' &&
      args[0] !== null &&
      typeof args[1] === 'string'
    ) {
      consola.error(args[1] || '', args[0]);
    } else {
      consola.error(...args);
    }
  },
  warn: (...args) => {
    if (args.length === 0) {
      return;
    }
    if (
      args.length === 2 &&
      typeof args[0] === 'object' &&
      args[0] !== null &&
      typeof args[1] === 'string'
    ) {
      consola.warn(args[1] || '', args[0]);
    } else {
      consola.warn(...args);
    }
  },
  debug: (...args) => {
    if (args.length === 0) {
      return;
    }
    if (
      args.length === 2 &&
      typeof args[0] === 'object' &&
      args[0] !== null &&
      typeof args[1] === 'string'
    ) {
      consola.debug(args[1] || '', args[0]);
    } else {
      consola.debug(...args);
    }
  },
  log: (...args) => {
    if (args.length === 0) {
      return;
    }
    if (
      args.length === 2 &&
      typeof args[0] === 'object' &&
      args[0] !== null &&
      typeof args[1] === 'string'
    ) {
      consola.log(args[1] || '', args[0]);
    } else {
      consola.log(...args);
    }
  },
  // Expose consola directly for advanced usage
  consola,
};

export default logger;
