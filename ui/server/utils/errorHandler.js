import { StatusCodes } from '#core/constants';
import { toApplicationError } from '#core/libraries/errors/ApplicationError.js';

/**
 * Standardized error handler for controllers
 * Converts errors to consistent HTTP responses
 *
 * @param {Error|ApplicationError} error - The error to handle
 * @param {Object} res - Express response object
 * @param {Object} logger - Logger instance
 * @param {string} context - Context for logging (e.g., 'Error in endpoint name')
 */
export function handleError(error, res, logger, context) {
  const appError = toApplicationError(error, 'An unexpected error occurred');

  // Log error with full context
  logger?.error(
    {
      error: appError.message,
      statusCode: appError.statusCode,
      stack: appError.stack,
      originalError: appError.error?.message,
    },
    context || 'Error handling request'
  );

  // Send standardized error response
  res.status(appError.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(appError.toResponse());
}

/**
 * Handle validation errors specifically
 * @param {string} message - Validation error message
 * @param {Object} res - Express response object
 * @param {Object} logger - Logger instance
 */
export function handleValidationError(message, res, logger) {
  logger?.warn({ message }, 'Validation error');
  res.status(StatusCodes.BAD_REQUEST).json({
    error: 'ValidationError',
    message,
  });
}
