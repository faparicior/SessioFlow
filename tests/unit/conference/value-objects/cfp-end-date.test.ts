import {describe, it, expect} from 'vitest';
import {CfpEndDate} from '@/modules/conference/domain/value-objects/cfp-end-date';

describe('CfpEndDate', () => {
  it('creates a valid future date', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const endDate = CfpEndDate.create(futureDate);
    expect(endDate.value).toBe(futureDate);
  });

  it('creates from ISO string', () => {
    const isoString = '2026-09-30T00:00:00.000Z';
    const endDate = CfpEndDate.fromISOString(isoString);
    expect(endDate.value).toBeDefined();
  });

  it('checks if after another date', () => {
    const date1 = new Date();
    date1.setDate(date1.getDate() + 1);
    const date2 = new Date();
    date2.setDate(date2.getDate() + 2);

    const end1 = CfpEndDate.create(date1);
    const end2 = CfpEndDate.create(date2);

    expect(end2.isAfter(end1)).toBe(true);
    expect(end1.isAfter(end2)).toBe(false);
  });
});
