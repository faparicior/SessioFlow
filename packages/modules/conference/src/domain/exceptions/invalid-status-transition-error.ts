import {DomainInvariantError} from '@sessioflow/shared-domain/exceptions';

export class InvalidStatusTransitionError extends DomainInvariantError {
  constructor(from: string = 'UNKNOWN', to: string = 'UNKNOWN') {
    super('STATE_TRANSITION_INVALID', `Invalid status transition from ${from} to ${to}`);
    this.name = 'InvalidStatusTransitionError';
  }
}
