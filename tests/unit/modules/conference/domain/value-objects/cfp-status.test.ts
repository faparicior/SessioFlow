import {describe, expect, it} from 'vitest';
import {CfpStatus} from '@sessioflow/conference/domain/value-objects/cfp-status';
import {InvalidCfpStatusError} from '@sessioflow/conference/domain/exceptions/invalid-cfp-status-error';

describe('CfpStatus', () => {
  it('creates valid statuses', () => {
    for (const status of ['ACTIVE', 'CLOSED', 'ARCHIVED']) {
      expect(CfpStatus.create(status).value).toBe(status);
    }
  });

  it('rejects unknown statuses', () => {
    expect(() => CfpStatus.create('BOGUS')).toThrow(InvalidCfpStatusError);
    expect(() => CfpStatus.create('active')).toThrow(InvalidCfpStatusError);
  });

  it('validates transitions (ACTIVE -> CLOSED -> ARCHIVED)', () => {
    expect(CfpStatus.canTransitionTo(CfpStatus.create('ACTIVE'), CfpStatus.create('CLOSED'))).toBe(
      true,
    );
    expect(
      CfpStatus.canTransitionTo(CfpStatus.create('CLOSED'), CfpStatus.create('ARCHIVED')),
    ).toBe(true);
    expect(
      CfpStatus.canTransitionTo(CfpStatus.create('ACTIVE'), CfpStatus.create('ARCHIVED')),
    ).toBe(false);
    expect(CfpStatus.canTransitionTo(CfpStatus.create('CLOSED'), CfpStatus.create('ACTIVE'))).toBe(
      false,
    );
  });

  it('reports whether the CfP is accepting submissions', () => {
    expect(CfpStatus.isAcceptingSubmissions(CfpStatus.create('ACTIVE'))).toBe(true);
    expect(CfpStatus.isAcceptingSubmissions(CfpStatus.create('CLOSED'))).toBe(false);
  });

  it('reconstitutes persisted statuses via fromData', () => {
    expect(CfpStatus.fromData('CLOSED').value).toBe('CLOSED');
  });

  it('implements structural equality', () => {
    expect(CfpStatus.create('ACTIVE').equals(CfpStatus.create('ACTIVE'))).toBe(true);
    expect(CfpStatus.create('ACTIVE').equals(CfpStatus.create('CLOSED'))).toBe(false);
  });
});
