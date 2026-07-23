import { DomainInvariantError } from '@sessioflow/shared-domain/exceptions';

/**
 * SubmissionDateInPastError - Submission date is in the past.
 */
export class SubmissionDateInPastError extends DomainInvariantError {
  constructor() {
    super('SUBMISSION_DATE_IN_PAST', 'Submission date must be in the future');
    this.name = 'SubmissionDateInPastError';
  }
}
