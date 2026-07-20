/**
 * SubmissionDateInPastError - Submission date is in the past.
 */
export class SubmissionDateInPastError extends Error {
  constructor() {
    super('Submission date must be in the future');
    this.name = 'SubmissionDateInPastError';
  }
}
