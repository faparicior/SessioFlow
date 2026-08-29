import {describe, expect, it} from 'vitest';
import {CfpEndDate} from '@sessioflow/conference/domain/value-objects/cfp-end-date';
import {InvalidCfpEndDateError} from '@sessioflow/conference/domain/exceptions/invalid-cfp-end-date-error';
import {futureDate, pastDate} from '../../../../__helpers__/date';

describe('CfpEndDate', () => {
  it('creates a valid end date', () => {
    const end = CfpEndDate.create(futureDate(30));
    expect(end.value.getTime()).toBe(futureDate(30).getTime());
  });

  it('rejects invalid dates', () => {
    expect(() => CfpEndDate.create(new Date('not-a-date'))).toThrow(InvalidCfpEndDateError);
    expect(() => CfpEndDate.create(new Date('not-a-date'))).toThrow(
      'CfpEndDate is not a valid date',
    );
  });

  it('reconstitutes historical end dates via fromData', () => {
    const historical = CfpEndDate.fromData(pastDate(10));
    expect(historical.value.getTime()).toBe(pastDate(10).getTime());
  });

  it('computes days remaining', () => {
    expect(CfpEndDate.create(futureDate(5)).daysRemaining()).toBe(5);
  });

  it('compares against other dates', () => {
    const end = CfpEndDate.create(futureDate(30));
    expect(end.isAfter(futureDate(10))).toBe(true);
    expect(end.isAfter(futureDate(60))).toBe(false);
  });

  it('implements structural equality', () => {
    const a = CfpEndDate.create(futureDate(30));
    const b = CfpEndDate.create(futureDate(30));
    expect(a.equals(b)).toBe(true);
    expect(a.equals(CfpEndDate.create(futureDate(31)))).toBe(false);
  });
});
