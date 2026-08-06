import { describe, it, expect } from 'vitest';
import { DomainInvariantError, DomainForbiddenError } from '@sessioflow/shared-domain/exceptions';
import { InvalidConferenceError } from '@sessioflow/conference/domain/exceptions/invalid-conference-error';
import { ConferenceNameTooShortError } from '@sessioflow/conference/domain/exceptions/conference-name-too-short-error';
import { ConferenceNameTooLongError } from '@sessioflow/conference/domain/exceptions/conference-name-too-long-error';
import { CfpDatesInvalidError } from '@sessioflow/conference/domain/exceptions/cfp-dates-invalid-error';
import { ConferenceFreeTierLimitError } from '@sessioflow/conference/domain/exceptions/conference-free-tier-limit-error';
import { StateTransitionError } from '@sessioflow/conference/domain/exceptions/state-transition-error';
import { SubmissionDateInPastError } from '@sessioflow/conference/domain/exceptions/submission-date-in-past-error';
import { MaxSubmissionsInvalidError } from '@sessioflow/conference/domain/exceptions/max-submissions-invalid-error';
import { InvalidConferenceIdError } from '@sessioflow/conference/domain/exceptions/invalid-conference-id-error';
import { EmptySlugError } from '@sessioflow/conference/domain/exceptions/empty-slug-error';
import { InvalidCfpStartDateError } from '@sessioflow/conference/domain/exceptions/invalid-cfp-start-date-error';
import { InvalidCfpEndDateError } from '@sessioflow/conference/domain/exceptions/invalid-cfp-end-date-error';
import { CfpStartDateNotInFutureError } from '@sessioflow/conference/domain/exceptions/cfp-start-date-not-in-future-error';

describe('Domain Exceptions', () => {
  it('InvalidConferenceError has correct name and message', () => {
    const errorWithCustom = new InvalidConferenceError('test');
    expect(errorWithCustom.name).toBe('InvalidConferenceError');
    expect(errorWithCustom.message).toBe('test');
    expect(errorWithCustom).toBeInstanceOf(Error);

    const defaultError = new InvalidConferenceError();
    expect(defaultError.message).toBe('Invalid conference operation');
  });

  it('ConferenceNameTooShortError has correct message', () => {
    const error = new ConferenceNameTooShortError();
    expect(error.name).toBe('ConferenceNameTooShortError');
    expect(error.message).toBe('Conference name must be at least 3 characters');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DomainInvariantError);
  });

  it('ConferenceNameTooLongError has correct message', () => {
    const error = new ConferenceNameTooLongError();
    expect(error.name).toBe('ConferenceNameTooLongError');
    expect(error.message).toBe('Conference name must be at most 100 characters');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DomainInvariantError);
  });

  it('CfpDatesInvalidError has default and custom messages', () => {
    const defaultError = new CfpDatesInvalidError();
    expect(defaultError.name).toBe('CfpDatesInvalidError');
    expect(defaultError.message).toBe('CfP end date must be after start date');
    expect(defaultError).toBeInstanceOf(Error);
    expect(defaultError).toBeInstanceOf(DomainInvariantError);

    const customError = new CfpDatesInvalidError('dates are invalid');
    expect(customError.message).toBe('dates are invalid');
  });

  it('ConferenceFreeTierLimitError has correct message', () => {
    const error = new ConferenceFreeTierLimitError();
    expect(error.name).toBe('ConferenceFreeTierLimitError');
    expect(error.message).toContain('Free tier limit exceeded');
    expect(error.message).toContain('5 active conferences');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DomainForbiddenError);
  });

  it('StateTransitionError has default and custom messages', () => {
    const defaultError = new StateTransitionError();
    expect(defaultError.name).toBe('StateTransitionError');
    expect(defaultError.message).toBe('Invalid state transition attempted');
    expect(defaultError).toBeInstanceOf(Error);
    expect(defaultError).toBeInstanceOf(DomainInvariantError);

    const customError = new StateTransitionError('invalid transition');
    expect(customError.message).toBe('invalid transition');
  });

  it('SubmissionDateInPastError has correct message', () => {
    const error = new SubmissionDateInPastError();
    expect(error.name).toBe('SubmissionDateInPastError');
    expect(error.message).toBe('Submission date must be in the future');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DomainInvariantError);
  });

  it('MaxSubmissionsInvalidError has correct message', () => {
    const error = new MaxSubmissionsInvalidError();
    expect(error.name).toBe('MaxSubmissionsInvalidError');
    expect(error.message).toBe('MaxSubmissions must be a positive integer');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DomainInvariantError);
  });

  it('InvalidConferenceIdError has correct message', () => {
    const error = new InvalidConferenceIdError();
    expect(error.name).toBe('InvalidConferenceIdError');
    expect(error.message).toBe('Invalid UUID format for ConferenceId');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DomainInvariantError);
  });

  it('EmptySlugError has correct message', () => {
    const error = new EmptySlugError();
    expect(error.name).toBe('EmptySlugError');
    expect(error.message).toBe('ConferenceSlug cannot be empty');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DomainInvariantError);
  });

  it('InvalidCfpStartDateError has correct message', () => {
    const error = new InvalidCfpStartDateError();
    expect(error.name).toBe('InvalidCfpStartDateError');
    expect(error.message).toBe('Invalid CfpStartDate');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DomainInvariantError);
  });

  it('InvalidCfpEndDateError has correct message', () => {
    const error = new InvalidCfpEndDateError();
    expect(error.name).toBe('InvalidCfpEndDateError');
    expect(error.message).toBe('Invalid CfpEndDate');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DomainInvariantError);
  });

  it('CfpStartDateNotInFutureError has correct message', () => {
    const error = new CfpStartDateNotInFutureError();
    expect(error.name).toBe('CfpStartDateNotInFutureError');
    expect(error.message).toBe('CfpStartDate must be in the future or today');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DomainInvariantError);
  });
});
