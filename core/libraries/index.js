/**
 * Library layer exports
 * Libraries are pure utilities with no dependencies on services or repositories
 */
export { SerializationLibrary } from './SerializationLibrary.js';
export { LoggerLibrary } from './LoggerLibrary.js';
export { createTransport } from './TransportLibrary.js';
export { CompositeError, isError, getErrors } from './ErrorLibrary.js';
export {
  ApplicationError,
  ValidationError,
  NotFoundError,
  ServiceUnavailableError,
  InternalServerError,
  isApplicationError,
  toApplicationError,
} from './errors/ApplicationError.js';
export { default as bootstrapLogger } from './bootstrap-logger.js';
