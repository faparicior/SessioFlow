/**
 * StateTransitionError - Invalid state transition attempted.
 */
export class StateTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StateTransitionError';
  }
}
