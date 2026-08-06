import { DomainInvariantError } from '@sessioflow/shared-domain/exceptions';

/**
 * MaxSubmissionsInvalidError - MaxSubmissions value is invalid (must be a positive integer if provided).
 */
export class MaxSubmissionsInvalidError extends DomainInvariantError {
  constructor() {
    super('MAX_SUBMISSIONS_INVALID', 'MaxSubmissions must be a positive integer');
    this.name = 'MaxSubmissionsInvalidError';
  }
}
