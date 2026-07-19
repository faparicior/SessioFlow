import {describe, it, expect} from 'vitest';
import {InvalidConferenceError} from '@backend/modules/conference/domain/exceptions/invalid-conference-error';
import {ConferenceNameTooShortError} from '@backend/modules/conference/domain/exceptions/conference-name-too-short-error';
import {CfpDatesInvalidError} from '@backend/modules/conference/domain/exceptions/cfp-dates-invalid-error';
import {ConferenceFreeTierLimitError} from '@backend/modules/conference/domain/exceptions/conference-free-tier-limit-error';
import {StateTransitionError} from '@backend/modules/conference/domain/exceptions/state-transition-error';
import {SubmissionDateInPastError} from '@backend/modules/conference/domain/exceptions/submission-date-in-past-error';

describe('Domain Exceptions', () => {
  it('InvalidConferenceError has correct name and message', () => {
    const error = new InvalidConferenceError('test');
    expect(error.name).toBe('InvalidConferenceError');
    expect(error.message).toBe('test');
    expect(error).toBeInstanceOf(Error);
  });

  it('ConferenceNameTooShortError has correct message', () => {
    const error = new ConferenceNameTooShortError();
    expect(error.name).toBe('ConferenceNameTooShortError');
    expect(error.message).toBe('Conference name must be at least 3 characters');
    expect(error).toBeInstanceOf(Error);
  });

  it('CfpDatesInvalidError has correct message', () => {
    const error = new CfpDatesInvalidError('dates are invalid');
    expect(error.name).toBe('CfpDatesInvalidError');
    expect(error.message).toBe('dates are invalid');
    expect(error).toBeInstanceOf(Error);
  });

  it('ConferenceFreeTierLimitError has correct message', () => {
    const error = new ConferenceFreeTierLimitError();
    expect(error.name).toBe('ConferenceFreeTierLimitError');
    expect(error.message).toContain('Free tier limit exceeded');
    expect(error.message).toContain('5 active conferences');
    expect(error).toBeInstanceOf(Error);
  });

  it('StateTransitionError has correct message', () => {
    const error = new StateTransitionError('invalid transition');
    expect(error.name).toBe('StateTransitionError');
    expect(error.message).toBe('invalid transition');
    expect(error).toBeInstanceOf(Error);
  });

  it('SubmissionDateInPastError has correct message', () => {
    const error = new SubmissionDateInPastError();
    expect(error.name).toBe('SubmissionDateInPastError');
    expect(error.message).toBe('Submission date must be in the future');
    expect(error).toBeInstanceOf(Error);
  });
});
