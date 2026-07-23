import { DomainInvariantError } from '@sessioflow/shared-domain/exceptions';

/**
 * StateTransitionError - Invalid state transition attempted.
 */
export class StateTransitionError extends DomainInvariantError {
  constructor(message: string) {
    super('STATE_TRANSITION_INVALID', message);
    this.name = 'StateTransitionError';
  }
}
