import { CompositeError } from '../../../common/error.js';

export class InternalServerError extends CompositeError {
  constructor(message, error) {
    super('InternalServerError', message, error);
  }
}
