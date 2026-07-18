import {describe, it, expect} from 'vitest';
import {CfpStartDate} from '@/modules/conference/domain/value-objects/cfp-start-date';

describe('CfpStartDate', () => {
  it('creates a valid future date', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const startDate = CfpStartDate.create(futureDate);
    expect(startDate.value).toBe(futureDate);
  });

  it('creates today as start date', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = CfpStartDate.create(today);
    expect(startDate.value).toBe(today);
  });

  it('creates from ISO string', () => {
    const isoString = '2026-08-01T00:00:00.000Z';
    const startDate = CfpStartDate.fromISOString(isoString);
    expect(startDate.value).toBeDefined();
  });

  it('checks if before another date', () => {
    const date1 = new Date();
    date1.setDate(date1.getDate() + 1);
    const date2 = new Date();
    date2.setDate(date2.getDate() + 2);

    const start1 = CfpStartDate.create(date1);
    const start2 = CfpStartDate.create(date2);

    expect(start1.isBefore(start2.value)).toBe(true);
    expect(start2.isBefore(start1.value)).toBe(false);
  });
});
