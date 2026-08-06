import { DomainInvariantError } from '@sessioflow/shared-domain/exceptions';

/**
 * StateTransitionError - Invalid state transition attempted.
 */
export class StateTransitionError extends DomainInvariantError {
  constructor(message = 'Invalid state transition attempted') {
    super('STATE_TRANSITION_INVALID', message);
    this.name = 'StateTransitionError';
  }
}
