import { CompositeError } from '../ErrorLibrary.js';

/**
 * Base application error class
 * All custom errors should extend this
 */
export class ApplicationError extends CompositeError {
  constructor(name, message, statusCode = 500, error = null) {
    super(name, message, error);
    this.statusCode = statusCode;
    this.name = name;
  }

  /**
   * Convert error to HTTP response format
   * @returns {{error: string, message: string, details?: string}}
   */
  toResponse() {
    return {
      error: this.name,
      message: this.message,
      ...(this.error && { details: this.error.message || String(this.error) }),
    };
  }
}

/**
 * Validation error (400 Bad Request)
 */
export class ValidationError extends ApplicationError {
  constructor(message, error = null) {
    super('ValidationError', message, 400, error);
  }
}

/**
 * Not found error (404 Not Found)
 */
export class NotFoundError extends ApplicationError {
  constructor(message, error = null) {
    super('NotFoundError', message, 404, error);
  }
}

/**
 * Service unavailable error (503 Service Unavailable)
 */
export class ServiceUnavailableError extends ApplicationError {
  constructor(message, error = null) {
    super('ServiceUnavailableError', message, 503, error);
  }
}

/**
 * Internal server error (500 Internal Server Error)
 */
export class InternalServerError extends ApplicationError {
  constructor(message, error = null) {
    super('InternalServerError', message, 500, error);
  }
}

/**
 * Check if error is an ApplicationError
 * @param {*} error
 * @returns {boolean}
 */
export function isApplicationError(error) {
  return error instanceof ApplicationError;
}

/**
 * Convert any error to ApplicationError
 * @param {Error|ApplicationError} error
 * @param {string} defaultMessage
 * @returns {ApplicationError}
 */
export function toApplicationError(error, defaultMessage = 'An unexpected error occurred') {
  if (isApplicationError(error)) {
    return error;
  }

  // Check for common error patterns
  if (error?.message?.includes('ECONNREFUSED') || error?.message?.includes('connect')) {
    return new ServiceUnavailableError('Service unavailable', error);
  }

  if (error?.message?.includes('required')) {
    return new ValidationError(error.message, error);
  }

  if (error?.message?.includes('not found') || error?.code === 'ENOENT') {
    return new NotFoundError(error.message || 'Resource not found', error);
  }

  return new InternalServerError(defaultMessage, error);
}
