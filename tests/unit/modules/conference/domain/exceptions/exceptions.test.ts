import {describe, expect, it} from 'vitest';
import {
  DomainConflictError,
  DomainError,
  DomainForbiddenError,
  DomainInvariantError,
  EntityNotFoundError,
} from '@sessioflow/shared-domain/exceptions';
import {ConferenceFreeTierLimitError} from '@sessioflow/conference/domain/exceptions/conference-free-tier-limit-error';
import {ConferenceNameTooLongError} from '@sessioflow/conference/domain/exceptions/conference-name-too-long-error';
import {ConferenceNameTooShortError} from '@sessioflow/conference/domain/exceptions/conference-name-too-short-error';
import {ConferenceNotFoundError} from '@sessioflow/conference/domain/exceptions/conference-not-found-error';
import {CfpDatesInvalidError} from '@sessioflow/conference/domain/exceptions/cfp-dates-invalid-error';
import {CfpStartDateNotInFutureError} from '@sessioflow/conference/domain/exceptions/cfp-start-date-not-in-future-error';
import {EmptySlugError} from '@sessioflow/conference/domain/exceptions/empty-slug-error';
import {InvalidCfpEndDateError} from '@sessioflow/conference/domain/exceptions/invalid-cfp-end-date-error';
import {InvalidCfpStartDateError} from '@sessioflow/conference/domain/exceptions/invalid-cfp-start-date-error';
import {InvalidCfpStatusError} from '@sessioflow/conference/domain/exceptions/invalid-cfp-status-error';
import {InvalidConferenceStatusError} from '@sessioflow/conference/domain/exceptions/invalid-conference-status-error';
import {InvalidStatusTransitionError} from '@sessioflow/conference/domain/exceptions/invalid-status-transition-error';
import {MaxSubmissionsInvalidError} from '@sessioflow/conference/domain/exceptions/max-submissions-invalid-error';
import {SlugExistsError} from '@sessioflow/conference/domain/exceptions/slug-exists-error';

describe('Conference domain exceptions', () => {
  it('maps validation failures to their error codes (HTTP 400 set)', () => {
    const cases: Array<[DomainError, string]> = [
      [new ConferenceNameTooShortError(), 'NAME_TOO_SHORT'],
      [new ConferenceNameTooLongError(), 'NAME_TOO_LONG'],
      [new EmptySlugError(), 'EMPTY_SLUG'],
      [new InvalidCfpStartDateError(), 'INVALID_CFP_START_DATE'],
      [new CfpStartDateNotInFutureError(), 'CFP_START_DATE_NOT_IN_FUTURE'],
      [new InvalidCfpEndDateError(), 'INVALID_CFP_END_DATE'],
      [new CfpDatesInvalidError(), 'CFP_DATES_INVALID'],
      [new MaxSubmissionsInvalidError(), 'MAX_SUBMISSIONS_INVALID'],
      [new InvalidConferenceStatusError(), 'INVALID_CONFERENCE_STATUS'],
      [new InvalidStatusTransitionError(), 'STATE_TRANSITION_INVALID'],
    ];
    for (const [error, code] of cases) {
      expect(error).toBeInstanceOf(DomainError);
      expect(error.code).toBe(code);
      expect(error.name).toBe(error.constructor.name);
    }
  });

  it('classifies slug conflicts as conflicts (HTTP 409)', () => {
    const error = new SlugExistsError();
    expect(error).toBeInstanceOf(DomainConflictError);
    expect(error.code).toBe('SLUG_EXISTS');
    expect(error.message).toBe('Conference slug already exists');
  });

  it('classifies the free tier limit as forbidden (HTTP 403)', () => {
    const error = new ConferenceFreeTierLimitError();
    expect(error).toBeInstanceOf(DomainForbiddenError);
    expect(error.code).toBe('FREE_TIER_LIMIT');
    expect(error.message).toContain('upgrade your plan');
  });

  it('classifies missing conferences as not found (HTTP 404)', () => {
    const error = new ConferenceNotFoundError('some-id');
    expect(error).toBeInstanceOf(EntityNotFoundError);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toContain('some-id');
  });

  it('treats invariant violations as domain invariants', () => {
    expect(new CfpDatesInvalidError()).toBeInstanceOf(DomainInvariantError);
    expect(new CfpDatesInvalidError().message).toBe(
      'End date must be after start date',
    );
    expect(
      new CfpDatesInvalidError('Cfp window cannot be more than 180 days').message,
    ).toBe('Cfp window cannot be more than 180 days');
  });

  it('reports user-facing validation messages', () => {
    expect(new ConferenceNameTooShortError().message).toBe(
      'Conference name must be at least 3 characters',
    );
    expect(new ConferenceNameTooLongError().message).toBe(
      'Conference name cannot exceed 100 characters',
    );
    expect(new CfpStartDateNotInFutureError().message).toBe(
      'CfpStartDate must be in the future or today',
    );
    expect(new InvalidCfpStartDateError().message).toBe(
      'CfpStartDate is not a valid date',
    );
    expect(new InvalidCfpEndDateError().message).toBe(
      'CfpEndDate is not a valid date',
    );
    expect(new MaxSubmissionsInvalidError().message).toBe(
      'Max submissions must be a positive integer',
    );
    expect(new InvalidCfpStatusError().message).toMatch(/cfp status/i);
  });
});
