import {describe, it, expect} from 'vitest';
import {
  ConferenceStatus,
  ConferenceStatusFromString,
  ConferenceStatusValidationError,
  isConferenceStatus,
} from '@backend/modules/conference/domain/value-objects/conference-status';

function isErrorWithMessage(error: unknown): error is ConferenceStatusValidationError {
  return error instanceof ConferenceStatusValidationError;
}

describe('ConferenceStatus', () => {
  describe('isConferenceStatus', () => {
    it('returns true for valid status strings', () => {
      expect(isConferenceStatus('DRAFT')).toBe(true);
      expect(isConferenceStatus('CFP_OPEN')).toBe(true);
      expect(isConferenceStatus('CFP_CLOSED')).toBe(true);
      expect(isConferenceStatus('REVIEWING')).toBe(true);
      expect(isConferenceStatus('SCHEDULED')).toBe(true);
      expect(isConferenceStatus('PUBLISHED')).toBe(true);
      expect(isConferenceStatus('COMPLETED')).toBe(true);
      expect(isConferenceStatus('DELETED')).toBe(true);
    });

    it('returns false for invalid strings', () => {
      expect(isConferenceStatus('INVALID')).toBe(false);
      expect(isConferenceStatus('draft')).toBe(false);
      expect(isConferenceStatus('')).toBe(false);
    });

    it('returns false for non-string values', () => {
      expect(isConferenceStatus(123)).toBe(false);
      expect(isConferenceStatus(null)).toBe(false);
      expect(isConferenceStatus(undefined)).toBe(false);
      expect(isConferenceStatus({})).toBe(false);
    });
  });

  describe('ConferenceStatusFromString', () => {
    it('returns the correct enum value for valid status', () => {
      expect(ConferenceStatusFromString('DRAFT')).toBe(ConferenceStatus.DRAFT);
      expect(ConferenceStatusFromString('CFP_OPEN')).toBe(
        ConferenceStatus.CFP_OPEN,
      );
      expect(ConferenceStatusFromString('COMPLETED')).toBe(
        ConferenceStatus.COMPLETED,
      );
    });

    it('throws ConferenceStatusValidationError for invalid strings', () => {
      expect(() => ConferenceStatusFromString('INVALID')).toThrow(
        ConferenceStatusValidationError,
      );
      expect(() => ConferenceStatusFromString('draft')).toThrow(
        ConferenceStatusValidationError,
      );
    });

    it('throws for non-string values', () => {
      expect(() => ConferenceStatusFromString(123)).toThrow(
        ConferenceStatusValidationError,
      );
      expect(() => ConferenceStatusFromString(null)).toThrow(
        ConferenceStatusValidationError,
      );
      expect(() =>
        ConferenceStatusFromString(undefined),
      ).toThrow(ConferenceStatusValidationError);
    });

    it('includes the invalid value in the error message', () => {
      try {
        ConferenceStatusFromString('BOGUS');
        expect.unreachable('Should have thrown');
      } catch (error) {
        if (!isErrorWithMessage(error)) {
          throw new Error('Expected ConferenceStatusValidationError', {cause: error});
        }

        expect(error.message).toContain(
          'BOGUS',
        );
      }
    });

    it('includes valid values in the error message', () => {
      try {
        ConferenceStatusFromString('INVALID');
        expect.unreachable('Should have thrown');
      } catch (error) {
        if (!isErrorWithMessage(error)) {
          throw new Error('Expected ConferenceStatusValidationError', {cause: error});
        }

        const {message} = error;

        expect(message).toContain('DRAFT');
        expect(message).toContain('CFP_OPEN');
        expect(message).toContain('COMPLETED');
      }
    });
  });
});
