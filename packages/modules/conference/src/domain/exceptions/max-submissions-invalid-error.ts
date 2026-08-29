import {DomainInvariantError} from '@sessioflow/shared-domain/exceptions';

export class MaxSubmissionsInvalidError extends DomainInvariantError {
  constructor() {
    super('MAX_SUBMISSIONS_INVALID', 'Max submissions must be a positive integer');
    this.name = 'MaxSubmissionsInvalidError';
  }
}
