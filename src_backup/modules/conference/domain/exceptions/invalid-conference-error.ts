/**
 * InvalidConferenceError - Base error for invalid conference operations.
 */
export class InvalidConferenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidConferenceError';
  }
}
