import {describe, it, expect} from 'vitest';
import {CfpStatus, CfpStatusValidator} from '@/domain/conference/value-objects/cfp-status.ts';

describe('CfpStatus', () => {
  it('has all expected status values', () => {
    expect(CfpStatus.ACTIVE).toBe('ACTIVE');
    expect(CfpStatus.CLOSED).toBe('CLOSED');
    expect(CfpStatus.ARCHIVED).toBe('ARCHIVED');
  });

  describe('CfpStatusValidator', () => {
    it('allows ACTIVE -> CLOSED transition', () => {
      expect(CfpStatusValidator.canTransition(CfpStatus.ACTIVE, CfpStatus.CLOSED)).toBe(true);
    });

    it('allows CLOSED -> ARCHIVED transition', () => {
      expect(CfpStatusValidator.canTransition(CfpStatus.CLOSED, CfpStatus.ARCHIVED)).toBe(true);
    });

    it('prevents ACTIVE -> ARCHIVED directly', () => {
      expect(CfpStatusValidator.canTransition(CfpStatus.ACTIVE, CfpStatus.ARCHIVED)).toBe(false);
    });

    it('ARCHIVED has no allowed transitions', () => {
      expect(CfpStatusValidator.canTransition(CfpStatus.ARCHIVED, CfpStatus.ACTIVE)).toBe(false);
    });

    it('isAcceptingSubmissions returns true only for ACTIVE', () => {
      expect(CfpStatusValidator.isAcceptingSubmissions(CfpStatus.ACTIVE)).toBe(true);
      expect(CfpStatusValidator.isAcceptingSubmissions(CfpStatus.CLOSED)).toBe(false);
      expect(CfpStatusValidator.isAcceptingSubmissions(CfpStatus.ARCHIVED)).toBe(false);
    });
  });
});
