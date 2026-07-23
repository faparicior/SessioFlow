import { describe, it, expect } from 'vitest';
import { InvalidConferenceError } from '@sessioflow/conference/domain/exceptions/invalid-conference-error';
import { ConferenceNameTooShortError } from '@sessioflow/conference/domain/exceptions/conference-name-too-short-error';
import { CfpDatesInvalidError } from '@sessioflow/conference/domain/exceptions/cfp-dates-invalid-error';
import { ConferenceFreeTierLimitError } from '@sessioflow/conference/domain/exceptions/conference-free-tier-limit-error';
import { StateTransitionError } from '@sessioflow/conference/domain/exceptions/state-transition-error';
import { SubmissionDateInPastError } from '@sessioflow/conference/domain/exceptions/submission-date-in-past-error';

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
  });

  it('CfpDatesInvalidError has default and custom messages', () => {
    const defaultError = new CfpDatesInvalidError();
    expect(defaultError.name).toBe('CfpDatesInvalidError');
    expect(defaultError.message).toBe('CfP end date must be after start date');
    expect(defaultError).toBeInstanceOf(Error);

    const customError = new CfpDatesInvalidError('dates are invalid');
    expect(customError.message).toBe('dates are invalid');
  });

  it('ConferenceFreeTierLimitError has correct message', () => {
    const error = new ConferenceFreeTierLimitError();
    expect(error.name).toBe('ConferenceFreeTierLimitError');
    expect(error.message).toContain('Free tier limit exceeded');
    expect(error.message).toContain('5 active conferences');
    expect(error).toBeInstanceOf(Error);
  });

  it('StateTransitionError has default and custom messages', () => {
    const defaultError = new StateTransitionError();
    expect(defaultError.name).toBe('StateTransitionError');
    expect(defaultError.message).toBe('Invalid state transition attempted');
    expect(defaultError).toBeInstanceOf(Error);

    const customError = new StateTransitionError('invalid transition');
    expect(customError.message).toBe('invalid transition');
  });

  it('SubmissionDateInPastError has correct message', () => {
    const error = new SubmissionDateInPastError();
    expect(error.name).toBe('SubmissionDateInPastError');
    expect(error.message).toBe('Submission date must be in the future');
    expect(error).toBeInstanceOf(Error);
  });
});
