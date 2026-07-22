import {describe, it, expect} from 'vitest';
import {CfpStatus} from '@sessioflow/conference/domain/value-objects/cfp-status';

describe('CfpStatus', () => {
  it('has correct enum values', () => {
    expect(CfpStatus.ACTIVE).toBe('ACTIVE');
    expect(CfpStatus.CLOSED).toBe('CLOSED');
    expect(CfpStatus.ARCHIVED).toBe('ARCHIVED');
  });
});
