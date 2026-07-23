import { DomainInvariantError } from '@sessioflow/shared-domain/exceptions';

/**
 * SubmissionDateInPastError - Submission date is in the past.
 */
export class SubmissionDateInPastError extends DomainInvariantError {
  constructor(message = 'Submission date must be in the future') {
    super('SUBMISSION_DATE_IN_PAST', message);
    this.name = 'SubmissionDateInPastError';
  }
}
