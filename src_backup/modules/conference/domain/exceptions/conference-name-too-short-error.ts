/**
 * ConferenceNameTooShortError - Conference name is too short (less than 3 characters).
 */
export class ConferenceNameTooShortError extends Error {
  constructor() {
    super('Conference name must be at least 3 characters');
    this.name = 'ConferenceNameTooShortError';
  }
}
