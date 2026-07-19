/**
 * ConferenceFreeTierLimitError - Free tier conference limit exceeded (max 5 active).
 */
export class ConferenceFreeTierLimitError extends Error {
  constructor() {
    super(
      'Free tier limit exceeded: maximum 5 active conferences allowed. Please upgrade your plan.',
    );
    this.name = 'ConferenceFreeTierLimitError';
  }
}
