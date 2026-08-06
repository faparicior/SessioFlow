/**
 * ConferenceStatus - The current state of a Conference lifecycle.
 *
 * Value Object: Enum
 * States:
 *   - DRAFT: Conference created but not yet published
 *   - CFP_OPEN: Call for Papers is live, accepting submissions
 *   - CFP_CLOSED: Submission deadline passed or manually closed
 *   - REVIEWING: Organizer actively reviewing submissions
 *   - SCHEDULED: Selection complete, schedule being finalized
 *   - PUBLISHED: Conference agenda live and public
 *   - COMPLETED: Conference concluded
 *   - DELETED: Conference cancelled
 */
export enum ConferenceStatus {
  DRAFT = 'DRAFT',
  CFP_OPEN = 'CFP_OPEN',
  CFP_CLOSED = 'CFP_CLOSED',
  REVIEWING = 'REVIEWING',
  SCHEDULED = 'SCHEDULED',
  PUBLISHED = 'PUBLISHED',
  COMPLETED = 'COMPLETED',
  DELETED = 'DELETED',
}

export const ConferenceStatusValues: readonly ConferenceStatus[] = [
  ConferenceStatus.DRAFT,
  ConferenceStatus.CFP_OPEN,
  ConferenceStatus.CFP_CLOSED,
  ConferenceStatus.REVIEWING,
  ConferenceStatus.SCHEDULED,
  ConferenceStatus.PUBLISHED,
  ConferenceStatus.COMPLETED,
  ConferenceStatus.DELETED,
];

import { DomainInvariantError } from '@sessioflow/shared-domain/exceptions';

export class ConferenceStatusValidationError extends DomainInvariantError {
  constructor(message = 'Invalid conference status') {
    super('INVALID_CONFERENCE_STATUS', message);
    this.name = 'ConferenceStatusValidationError';
  }
}

export function isConferenceStatus(value: unknown): value is ConferenceStatus {
  return typeof value === 'string' &&
    (ConferenceStatusValues as readonly unknown[]).includes(value);
}

export function ConferenceStatusFromString(value: unknown): ConferenceStatus {
  if (!isConferenceStatus(value)) {
    throw new ConferenceStatusValidationError(
      `Invalid ConferenceStatus: "${String(value)}". Expected one of: ${ConferenceStatusValues.join(', ')}`,
    );
  }

  return value;
}
