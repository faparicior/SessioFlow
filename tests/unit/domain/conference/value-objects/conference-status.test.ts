import {describe, it, expect} from 'vitest';
import {
  ConferenceStatus,
  ConferenceStatusValidator,
} from '@/domain/conference/value-objects/conference-status.ts';

describe('ConferenceStatus', () => {
  it('has all expected status values', () => {
    expect(ConferenceStatus.DRAFT).toBe('DRAFT');
    expect(ConferenceStatus.CFP_OPEN).toBe('CFP_OPEN');
    expect(ConferenceStatus.CFP_CLOSED).toBe('CFP_CLOSED');
    expect(ConferenceStatus.REVIEWING).toBe('REVIEWING');
    expect(ConferenceStatus.SCHEDULED).toBe('SCHEDULED');
    expect(ConferenceStatus.PUBLISHED).toBe('PUBLISHED');
    expect(ConferenceStatus.COMPLETED).toBe('COMPLETED');
    expect(ConferenceStatus.DELETED).toBe('DELETED');
  });

  describe('ConferenceStatusValidator', () => {
    it('allows DRAFT -> CFP_OPEN transition', () => {
      expect(ConferenceStatusValidator.canTransition(
        ConferenceStatus.DRAFT,
        ConferenceStatus.CFP_OPEN,
      )).toBe(true);
    });

    it('allows DRAFT -> DELETED transition', () => {
      expect(ConferenceStatusValidator.canTransition(
        ConferenceStatus.DRAFT,
        ConferenceStatus.DELETED,
      )).toBe(true);
    });

    it('prevents DRAFT -> COMPLETED transition', () => {
      expect(ConferenceStatusValidator.canTransition(
        ConferenceStatus.DRAFT,
        ConferenceStatus.COMPLETED,
      )).toBe(false);
    });

    it('allows CFP_OPEN -> CFP_CLOSED transition', () => {
      expect(ConferenceStatusValidator.canTransition(
        ConferenceStatus.CFP_OPEN,
        ConferenceStatus.CFP_CLOSED,
      )).toBe(true);
    });

    it('allows CFP_CLOSED -> REVIEWING transition', () => {
      expect(ConferenceStatusValidator.canTransition(
        ConferenceStatus.CFP_CLOSED,
        ConferenceStatus.REVIEWING,
      )).toBe(true);
    });

    it('allows REVIEWING -> SCHEDULED transition', () => {
      expect(ConferenceStatusValidator.canTransition(
        ConferenceStatus.REVIEWING,
        ConferenceStatus.SCHEDULED,
      )).toBe(true);
    });

    it('allows SCHEDULED -> PUBLISHED transition', () => {
      expect(ConferenceStatusValidator.canTransition(
        ConferenceStatus.SCHEDULED,
        ConferenceStatus.PUBLISHED,
      )).toBe(true);
    });

    it('allows PUBLISHED -> COMPLETED transition', () => {
      expect(ConferenceStatusValidator.canTransition(
        ConferenceStatus.PUBLISHED,
        ConferenceStatus.COMPLETED,
      )).toBe(true);
    });

    it('COMPLETED has no allowed transitions', () => {
      expect(ConferenceStatusValidator.canTransition(
        ConferenceStatus.COMPLETED,
        ConferenceStatus.DRAFT,
      )).toBe(false);
    });

    it('DELETED has no allowed transitions', () => {
      expect(ConferenceStatusValidator.canTransition(
        ConferenceStatus.DELETED,
        ConferenceStatus.DRAFT,
      )).toBe(false);
    });

    it('identifies terminal states', () => {
      expect(ConferenceStatusValidator.isTerminal(ConferenceStatus.COMPLETED)).toBe(true);
      expect(ConferenceStatusValidator.isTerminal(ConferenceStatus.DELETED)).toBe(true);
      expect(ConferenceStatusValidator.isTerminal(ConferenceStatus.DRAFT)).toBe(false);
    });
  });
});
