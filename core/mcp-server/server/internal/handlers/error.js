import { CompositeError } from '#core/libraries/ErrorLibrary.js';

export class InternalServerError extends CompositeError {
  constructor(message, error) {
    super('InternalServerError', message, error);
  }
}
