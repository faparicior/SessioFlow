import {describe, it, expect} from 'vitest';
import {CfpEndDate} from '@sessioflow/conference/domain/value-objects/cfp-end-date';
import {InvalidCfpEndDateError} from '@sessioflow/conference/domain/exceptions/invalid-cfp-end-date-error';

describe('CfpEndDate', () => {
  it('creates a valid date', () => {
    const date = new Date();
    const end = CfpEndDate.create(date);
    expect(end.value).toBe(date);
  });

  it('creates from ISO string', () => {
    const iso = new Date();
    const end = CfpEndDate.fromISOString(iso.toISOString());
    expect(end.value.getTime()).toBe(iso.getTime());
  });

  it('rejects invalid date (NaN)', () => {
    expect(() => CfpEndDate.create(new Date('invalid'))).toThrow(InvalidCfpEndDateError);
  });

  it('rejects invalid ISO string', () => {
    expect(() => CfpEndDate.fromISOString('not-a-date')).toThrow(InvalidCfpEndDateError);
  });

  it('checks if before another date', () => {
    const d1 = new Date('2024-01-01');
    const d2 = new Date('2024-01-02');
    const end = CfpEndDate.create(d1);
    expect(end.isBefore(d2)).toBe(true);
  });

  it('checks if after another date', () => {
    const d1 = new Date('2024-01-02');
    const d2 = new Date('2024-01-01');
    const end = CfpEndDate.create(d1);
    expect(end.isAfter(d2)).toBe(true);
  });
});
